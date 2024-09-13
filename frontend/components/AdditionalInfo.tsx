// AdditionalInfo.tsx

import React, { useState, useEffect } from 'react';
import {
  Box, Heading, Link, VStack, Divider, Spinner, Flex, Text,
  useColorMode, useColorModeValue, Code
} from '@chakra-ui/react';
import { RocketIcon, ExternalLinkIcon, ReloadIcon } from '@radix-ui/react-icons';
import { MathJax } from "better-react-mathjax";

type AdditionalInfoProps = {
  url: string;
  explanation: string;
  discussion_link?: string;
  question_id: number;
  questionDetails: {
    question_text: string;
    options: string[];
    answer: string;
  };
};

type CommentType = {
  username: string;
  yearsAgo: string;
  commentText: string;
};

const AdditionalInfo = ({ url, explanation, discussion_link, question_id, questionDetails }: AdditionalInfoProps) => {
  const [loadingRocket, setLoadingRocket] = useState(false); 
  const [loadingReload, setLoadingReload] = useState(false);
  const [furtherExplanation, setFurtherExplanation] = useState('');
  const [fetchedExplanation, setFetchedExplanation] = useState(false);
  const [discussionComments, setDiscussionComments] = useState<CommentType[]>([]);
  const { colorMode } = useColorMode();
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const fetchDiscussionComments = async () => {
    try {
      const response = await fetch(`http://k8s-threetie-mainlb-b5b9250791-1739950720.ap-southeast-2.elb.amazonaws.com/api/getDiscussionComments/${question_id}`);
      const data = await response.json();
      if (data.discussion_comments) {
        const commentPattern = /(.+?)said:(.+ago):(.+)/;
        const formattedComments: CommentType[] = data.discussion_comments.split('\n').map((comment: string) => {
          const match = commentPattern.exec(comment);
          if (match) {
            const [_, username, yearsAgo, commentText] = match;
            return {
              username: username.trim(),
              yearsAgo: yearsAgo.trim(),
              commentText: commentText.trim(),
            };
          }
          return null;
        }).filter(Boolean); // Filter out any null values if regex doesn't match
        setDiscussionComments(formattedComments);
      }
    } catch (error) {
      console.error('Error fetching discussion comments:', error);
    }
  };  

  useEffect(() => {
    fetchDiscussionComments();
  }, [question_id]);

  const renderDiscussionComments = () => {
    return discussionComments.map((comment, index) => (
        <Box key={index} borderWidth="1px" borderRadius="lg" p={3} my={2} borderColor={borderColor}>
            <Flex justifyContent="space-between">
                <Text fontWeight="bold">{comment.username} said:</Text>
                <Text fontStyle="italic">{comment.yearsAgo.replace(/:/g, '')}</Text>
            </Flex>
            <div dangerouslySetInnerHTML={{ __html: comment.commentText }} />
        </Box>
    ));
  };

  const processExplanationForImages = (text: string) => {
    const explanationImagePattern = /\(image\)q(\d+)_explanation_(\d+)\(image\)/gi;
    return text.replace(explanationImagePattern, (match, p1, p2) => {
      let imageName = `q${p1}_explanation_${p2}.png`;
      return `<img src="/static/assets/images/background/Explanation/${imageName}" alt="${imageName}" style="display: inline-block; width: auto; height: auto;">`;
    });
  };

  const formatBotResponse = (response: string) => {
    let formattedResponse = response;
  
    // Convert URLs into clickable links
    formattedResponse = formattedResponse.replace(/\[(\d+)\]: (https?:\/\/[^\s]+) "(.+)"/g, (match, p1, p2, p3) => {
      return `<a href="${p2}" target="_blank" rel="noopener noreferrer" style="color: blue; text-decoration: underline;">[${p1}] ${p3}</a><br/>`;
    });
  
    // Remove subscript references (e.g., [1][1]) and caret-bracketed references (e.g., [^1^][1])
    formattedResponse = formattedResponse.replace(/\[\^\d+\^\]\[\d+\]\s*|\[\d+\]\[\d+\]\s*/g, '');
  
    // Apply styling for bold text
    formattedResponse = formattedResponse.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  
    // Add new line and space before each option explanation
    formattedResponse = formattedResponse.replace(/- Option [ABCD]:/g, '<br/> $&');
  
    // Apply formatting for code blocks
    formattedResponse = formattedResponse.replace(/```[a-z]*\n([\s\S]*?)```/g, (match, code) => {
      return `<pre style="overflow-x: auto; padding: 2; font-size: small; background-color: gray.100; border-radius: medium;"><code>${code}</code></pre>`;
    });

    // Assuming the use of a basic string type for simplicity. Adjust as needed for your specific use case.
    type TableCell = string;

    // Convert markdown tables into HTML tables with inline CSS for proper styling
    const tablePattern = /\|(.+?)\|\n\|(.+?)\|\n((?:\|.+?\|\n)*)/g;
    formattedResponse = formattedResponse.replace(tablePattern, (match: string, headers: string, separators: string, rows: string) => {
      // Split headers and rows, then trim each cell
      const headerCells: TableCell[] = headers.split('|').map((header: string) => header.trim());
      const rowCells: TableCell[][] = rows.split('\n').map((row: string) => row.split('|').map((cell: string) => cell.trim()));

      // Remove the first and last cell if they are empty (caused by extra pipes)
      if (headerCells[0] === '') headerCells.shift();
      if (headerCells[headerCells.length - 1] === '') headerCells.pop();
      rowCells.forEach((cells: TableCell[]) => {
        if (cells[0] === '') cells.shift();
        if (cells[cells.length - 1] === '') cells.pop();
      });

      const thead = `<thead><tr>${headerCells.map((header: string) => `<th style="border: 1px solid #ddd; padding: 8px;">${header}</th>`).join('')}</tr></thead>`;
      const tbody = `<tbody>${rowCells.map((cells: TableCell[]) => `<tr>${cells.map((cell: string) => `<td style="border: 1px solid #ddd; padding: 8px;">${cell}</td>`).join('')}</tr>`).join('')}</tbody>`;
      return `<table style="border-collapse: collapse; width: 100%;">${thead}${tbody}</table>`;
    });

    return formattedResponse;
  };  

  const handleRocketClick = async () => {
    setLoadingRocket(true);
    localStorage.setItem(`loading-${question_id}`, 'true'); // Set loading state in local storage
    if (!fetchedExplanation) {
      try {
        const response = await fetch(`http://k8s-threetie-mainlb-b5b9250791-1739950720.ap-southeast-2.elb.amazonaws.com/api/getFurtherExplanation/${question_id}`);
        const data = await response.json();
        if (data.explanation) {
          localStorage.setItem(`furtherExplanation-${question_id}`, data.explanation);
          setFurtherExplanation(formatBotResponse(data.explanation));
          setFetchedExplanation(true);
        } else {
          const newResponse = await fetch(`http://k8s-threetie-mainlb-b5b9250791-1739950720.ap-southeast-2.elb.amazonaws.com/api/getFurtherExplanation`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(questionDetails)
          });
          const newData = await newResponse.json();
          await fetch(`http://k8s-threetie-mainlb-b5b9250791-1739950720.ap-southeast-2.elb.amazonaws.com/api/saveFurtherExplanation`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question_id: question_id, explanation: newData.further_explanation })
          });
          setFurtherExplanation(formatBotResponse(newData.further_explanation || 'Error fetching further explanation'));
          setFetchedExplanation(true);
        }
      } catch (error) {
        console.error('Error fetching further explanation:', error);
        setFurtherExplanation('Error fetching further explanation');
      }
    }
    setLoadingRocket(false);
    localStorage.setItem(`loading-${question_id}`, 'false'); // Reset loading state in local storage
  };

  // New function to handle reload click
  const handleReloadClick = async () => {
    setLoadingReload(true);
    try {
      // Make a new request to the server for a fresh explanation
      const newResponse = await fetch(`http://k8s-threetie-mainlb-b5b9250791-1739950720.ap-southeast-2.elb.amazonaws.com/api/getFurtherExplanation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(questionDetails)
      });
      const newData = await newResponse.json();
      // Save the new explanation to the database
      await fetch(`http://k8s-threetie-mainlb-b5b9250791-1739950720.ap-southeast-2.elb.amazonaws.com/api/saveFurtherExplanation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question_id: question_id, explanation: newData.further_explanation })
      });
      // Update the state with the new explanation
      setFurtherExplanation(formatBotResponse(newData.further_explanation || 'Error fetching further explanation'));
    } catch (error) {
      console.error('Error fetching further explanation:', error);
      setFurtherExplanation('Error fetching further explanation');
    }
    setLoadingReload(false);
  };

  const openLink = (link: string) => {
    window.open(link, '_blank');
  };

  return (
    <Box borderWidth="1px" borderRadius="lg" overflow="hidden" p={4}>
      <Heading size='md' mb={4}>Additional Info</Heading>
      <VStack divider={<Divider />} spacing={4} align="start">
        <Box>
          <Flex alignItems="center">
            <Heading size='18px' textTransform='uppercase'>Explanation</Heading>
            <Box ml={1}>
              {loadingRocket ? <Spinner size="xs" /> : <RocketIcon onClick={handleRocketClick} />}
            </Box>
          </Flex>
          <div dangerouslySetInnerHTML={{ __html: processExplanationForImages(explanation) }} />
        </Box>
        {furtherExplanation && (
          <Box>
            <MathJax dynamic>
              <Flex alignItems="center">
                <Heading size='18px' textTransform='uppercase'>Further Explanation</Heading>
                <Box ml={1}>
                {loadingReload ? <Spinner size="xs" /> : <ReloadIcon onClick={handleReloadClick} />}
                </Box>
              </Flex>
                <div dangerouslySetInnerHTML={{ __html: furtherExplanation }} />
            </MathJax>
          </Box>
        )}
        {url && (
          <Box>
            <Heading size='18px' textTransform='uppercase'>URL</Heading>
            <Flex alignItems="center">
              <Link href={url} isExternal>
                {url}
              </Link>
              <Box ml={1}>
                <ExternalLinkIcon onClick={() => openLink(url)} />
              </Box>
            </Flex>
          </Box>
        )}
        {discussion_link && (
          <Box>
            <Heading size='18px' textTransform='uppercase'>View in Discussions</Heading>
            <Flex alignItems="center">
              <Link href={discussion_link} isExternal>
                Go to Discussions Forum
              </Link>
              <Box ml={1}>
                <ExternalLinkIcon onClick={() => openLink(discussion_link)} />
              </Box>
            </Flex>
          </Box>
        )}
        {discussionComments.length > 0 && (
          <Box>
            <Heading size='18px' textTransform='uppercase'>Discussion Comments</Heading>
            {renderDiscussionComments()}
          </Box>
        )}
      </VStack>
    </Box>
  );
};

export default AdditionalInfo;