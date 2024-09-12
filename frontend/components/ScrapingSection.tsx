// ScrapingSection.tsx

import React, { useState } from 'react';
import { Box, Button, Textarea, Flex, useToast } from '@chakra-ui/react';

interface ScrapingSectionProps {
  onScrapeComplete: (success: boolean, quizSetTitle: string) => void;
  quizSetTitle: string;
}

const ScrapingSection: React.FC<ScrapingSectionProps> = ({ onScrapeComplete, quizSetTitle }) => {
  const [scrapeInput, setScrapeInput] = useState('');
  const [isScraping, setIsScraping] = useState(false);
  const toast = useToast();

  const handleScrape = async () => {
    if (!quizSetTitle.trim()) {
      toast({
        title: "Invalid Title",
        description: "Quiz set title cannot be empty.",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: 'bottom-right',
      });
      return;
    }
  
    const processingToastId = toast({
      title: 'Processing...',
      description: 'Scraping is in progress. Please wait.',
      status: 'info',
      duration: null,
      isClosable: true,
      position: 'bottom-right',
    });
  
    setIsScraping(true);
  
    const lines = scrapeInput.split('\n');
    let urls = lines.map(line => {
      console.log("Original Line:", line);
      line = line.trim();
      if (!line) return null;
  
      // Support for both specified formats
      if (line.includes("examveda")) {
        if (line.includes(',')) { // Format with start and end page
          const parts = line.split(/\s*,\s*/);
          const base_url = parts[0];
          const pageParts = parts.slice(1).map(part => {
            const [key, value] = part.split('=');
            return { [key.trim()]: value.trim() };
          }).reduce((acc, curr) => ({ ...acc, ...curr }), {});
          return { base_url, ...pageParts };
        } else { // Direct single URL without comma separation
          return { base_url: line };
        }
      } else if (line.includes("sanfoundry.com") || line.includes("pinoybix") || line.includes("web.archive.org")) {
        return line;
      } else {
        const [base_url, start_url, end_url] = line.split(',').map(s => s.trim());
        return { base_url, start_url, end_url };
      }
    }).filter(line => line);
  
    console.log("Final URLs sent to Backend:", JSON.stringify(urls, null, 2));
  
    try {
      const response = await fetch('http://localhost:5000/startScraping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: quizSetTitle, urls }),
      });
  
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
  
      const data = await response.json();
      // Removed the automatic download PDF functionality
  
      onScrapeComplete(true, quizSetTitle);
  
      toast({
        title: "Scraping Completed",
        description: "New quiz set added successfully.",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: 'bottom-right',
      });
    } catch (error) {
      console.error('Error during scraping:', error);
      onScrapeComplete(false, quizSetTitle);
      toast({
        title: "Scraping Failed",
        description: "An error occurred during scraping.",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: 'bottom-right',
      });
    } finally {
      toast.close(processingToastId);
      setIsScraping(false);
    }
  };  

// Function to download the quiz set as a PDF
const downloadQuizPdf = async (quizSetId: string) => {
  const response = await fetch(`http://localhost:5000/downloadQuizPdf/${quizSetId}`);
  const blob = await response.blob();
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = `${quizSetTitle}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
};

  return (
    <Box>
      <Textarea
        placeholder="Input URLs here. For Indiabix: [base_url], [start_url], [end_url]. For Pinoybix: [url]"
        mb={4}
        value={scrapeInput}
        onChange={(e) => setScrapeInput(e.target.value)}
        height="300px"
      />
      <Flex justify="center">
        <Button 
          onClick={handleScrape} 
          isLoading={isScraping}
          disabled={isScraping || !quizSetTitle.trim()}
          width="100px"
        >
          Scrape
        </Button>
      </Flex>
    </Box>
  );
};

export default ScrapingSection;