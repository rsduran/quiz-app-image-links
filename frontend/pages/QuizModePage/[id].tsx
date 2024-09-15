// QuizModePage.tsx

import React, { useState, useEffect } from 'react';
import {
  Box, Flex, Button, IconButton, Text, Input,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter,
  useDisclosure, useColorMode, useColorModeValue, Divider, Tooltip, useToast
} from '@chakra-ui/react';
import { ArrowLeftIcon, ArrowRightIcon, MoonIcon, SunIcon } from '@chakra-ui/icons'
import { Select, Highlight, Switch } from '@chakra-ui/react';
import { ExitIcon, UpdateIcon, StarIcon, MagnifyingGlassIcon, StarFilledIcon, EyeOpenIcon, EyeNoneIcon } from '@radix-ui/react-icons';
import QuestionDisplay from '../../components/QuestionDisplay';
import AdditionalInfo from '../../components/AdditionalInfo';
import SearchModal from '../../components/SearchModal';
import ConfirmationModal from '../../components/ConfirmationModal';
import SummaryModal from '../../components/SummaryModal';
import UnansweredQuestionsModal from '../../components/UnansweredQuestionsModal';
import ResetModal from '../../components/ResetModal';
import FlipCard from '../../components/FlipCard';
import { ShuffleIcon } from '@radix-ui/react-icons';
import { Question } from '../../utils/types';
import LoadingLayout from '../../components/LoadingLayout';
import { useRouter } from 'next/router';

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || '/api';

interface QuestionData {
  id: number;
  order: number;
  text: string;
  options: string[];
  answer: string;
  url: string;
  explanation: string;
  discussion_link: string;
  userSelectedOption: string | null;
  hasMathContent: boolean;
}

// Type for navigateToQuestion function
type NavigateToQuestionFunction = (index: number) => void;

const QuizModePage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [questions, setQuestions] = useState<Question[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isUnansweredQuestionsModalOpen, setIsUnansweredQuestionsModalOpen] = useState(false);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [unansweredQuestions, setUnansweredQuestions] = useState<Question[]>([]);
  const [score, setScore] = useState<number>(0);
  const [showFlipCard, setShowFlipCard] = useState(true);
  const [eyeIcon, setEyeIcon] = useState('open');
  const toast = useToast();
  const [shuffle, setShuffle] = useState(false);
  const [optionsShuffled, setOptionsShuffled] = useState(false);
  const [preserveShuffleState, setPreserveShuffleState] = useState({
    questionsShuffled: false,
    optionsShuffled: false
  });

  // Adjusted shuffleArray function to be generic, enabling it to shuffle any type of array.
  const shuffleArray = <T,>(array: T[]): void => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  };

  // Utility function to shuffle the options and update the answer.
  const shuffleOptionsAndUpdateAnswer = (questions: Question[]): Question[] => {
    console.log("Shuffling options for each question"); // Debug log
    return questions.map((question) => {
      const options = [...question.options];
      const correctAnswerContent = question.options.find((opt, idx) => `Option ${String.fromCharCode(65 + idx)}` === question.answer);
  
      shuffleArray(options);
  
      const newCorrectAnswerIndex = options.findIndex(opt => opt === correctAnswerContent);
      const newAnswerLabel = `Option ${String.fromCharCode(65 + newCorrectAnswerIndex)}`;
  
      return {
        ...question,
        options,
        answer: newAnswerLabel,
      };
    });
  };

  // Modify the useEffect hook that fetches and sets questions to reapply option shuffling if optionsShuffled is true
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch(`${backendUrl}/getQuestionsByQuizSet/${id}`);
        if (!response.ok) throw new Error('Network response was not ok');
        let data = await response.json();

        // Reapply option shuffle if optionsShuffled is true
        if (optionsShuffled) {
          data = shuffleOptionsAndUpdateAnswer(data);
        }

        setQuestions(data.map((q: QuestionData) => ({
          ...q,
          question: q.text,
          userSelectedOption: null
        })));
      } catch (error) {
        console.error('Error fetching questions:', error);
      }
    };

    if (id) {
      fetchQuestions();
    }
  }, [id, optionsShuffled]); // Add optionsShuffled as a dependency

  // Adjusted to better manage state updates and debugging
  const handleToggleShuffleOptions = () => {
    console.log("Toggling shuffle options from", optionsShuffled);

    // Immediately set the optionsShuffled state to its new value
    const newOptionsShuffledState = !optionsShuffled;
    setOptionsShuffled(newOptionsShuffledState);

    // Debug log to confirm state change
    console.log("Options shuffled state changed to", newOptionsShuffledState);

    // If the questions have been shuffled, reapply options shuffle directly
    if (preserveShuffleState.questionsShuffled) {
      console.log("Reapplying options shuffle to already shuffled questions");
      setQuestions(currentQuestions => {
        const newQuestions = shuffleOptionsAndUpdateAnswer([...currentQuestions]);
        console.log("Questions after reapplying option shuffle", newQuestions);
        return newQuestions;
      });
    } else {
      console.log("Options shuffle toggled, but questions not shuffled yet.");
    }

    // Update the preserveShuffleState to reflect the new optionsShuffled state
    setPreserveShuffleState(prevState => ({
      ...prevState,
      optionsShuffled: newOptionsShuffledState
    }));
  };

  const confirmShuffleQuestions = async () => {
    console.log("Confirming shuffle questions...");
    try {
      console.log("Before fetching shuffled questions");
      const shuffledResponse = await fetch(`${backendUrl}/shuffleQuestions/${id}`, { method: 'POST' });
      if (!shuffledResponse.ok) throw new Error('Error shuffling questions');
      
      let shuffledQuestions = await shuffledResponse.json();
      console.log("Shuffled questions received:", shuffledQuestions);
      
      // Reapply options shuffle if optionsShuffled is true
      if (optionsShuffled) {
        console.log("Reapplying options shuffle after questions shuffle");
        shuffledQuestions = shuffleOptionsAndUpdateAnswer(shuffledQuestions);
      }
    
      console.log("Setting preserve shuffle state");
      // Directly update state to reflect both shuffles
      setPreserveShuffleState({
        questionsShuffled: true,
        optionsShuffled
      });
      
      // Update the questions state with potentially double-shuffled questions
      setQuestions(shuffledQuestions.map((q: QuestionData) => ({
        ...q,
        question: q.text,
        userSelectedOption: null
      })));
      console.log("Questions state updated after shuffle");
    
      console.log("Resetting current question index to 0");
      setCurrentQuestionIndex(0);
      onConfirmationModalClose();
    
      toast({
        title: "Questions Shuffled",
        description: "Questions have been shuffled.",
        status: "info",
        duration: 3000,
        isClosable: true,
        position: "bottom-right"
      });
    } catch (error) {
      console.error('Error shuffling questions:', error);
    }
  };  

  const handleFlipCard = () => {
    setIsCardFlipped(prev => !prev);
  };

  const fetchUserSelections = async () => {
    try {
      const response = await fetch(`${backendUrl}/getUserSelections/${id}`);
      if (!response.ok) throw new Error('Network response was not ok');
      const selections = await response.json();
      setQuestions(prevQuestions => prevQuestions.map(q => ({
        ...q,
        userSelectedOption: selections[q.id] || null
      })));
    } catch (error) {
      console.error('Error fetching user selections:', error);
    }
  };

  const fetchQuestionsAndUpdateSelections = async () => {
    console.log("Fetching questions...");
    try {
      const response = await fetch(`${backendUrl}/getQuestionsByQuizSet/${id}`);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      console.log("Fetched Questions Data:", data);
      setQuestions(data.map((q: QuestionData) => ({
        id: q.id,
        question: q.text,
        options: q.options,
        answer: q.answer,
        url: q.url,
        explanation: q.explanation,
        discussion_link: q.discussion_link,
        hasMathContent: q.hasMathContent,
        userSelectedOption: null
      })));
      await fetchUserSelections();
    } catch (error) {
      console.error('Error fetching questions:', error);
    }
  };  

  const fetchEyeIconState = async () => {
    const response = await fetch(`${backendUrl}/getEyeIconState/${id}`);  // Use quiz set ID
    const data = await response.json();
    if (response.ok) {
      setEyeIcon(data.state ? 'open' : 'none');
      setShowFlipCard(data.state);
      setIsCardFlipped(!data.state);
    }
  };

  useEffect(() => {
    if (id) {
      fetchQuestionsAndUpdateSelections();
      fetchFavorites();
    }
  }, [id]);
  
  useEffect(() => {
    fetchEyeIconState();
  }, [currentQuestionIndex, questions]);

  useEffect(() => {
    const answeredQuestions = questions.filter(q => q.userSelectedOption !== null);
    const unansweredQuestions = questions.filter(q => q.userSelectedOption === null);
    switch (selectedFilter) {
      case 'favorites':
        setFilteredQuestions(questions.filter(question => favorites.has(question.id)));
        break;
      case 'answered':
        setFilteredQuestions(answeredQuestions);
        break;
      case 'unanswered':
        setFilteredQuestions(unansweredQuestions);
        break;
      default:
        setFilteredQuestions(questions);
    }
  }, [questions, favorites, selectedFilter]);

  const fetchFavorites = async () => {
    try {
      const response = await fetch(`${backendUrl}/getFavorites/${id}`);
      if (!response.ok) throw new Error('Network response was not ok');
      const favoritedQuestions = await response.json();
      setFavorites(new Set(favoritedQuestions.map((q: { id: number }) => q.id)));
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  };

  const handleNavigate = (action: string, value?: number) => {
    setIsCardFlipped(false);

    let newIndex = currentQuestionIndex;
    switch (action) {
      case 'prev':
        newIndex = Math.max(currentQuestionIndex - 1, 0);
        break;
      case 'next':
        newIndex = Math.min(currentQuestionIndex + 1, filteredQuestions.length - 1);
        break;
      case 'goto':
        newIndex = value ? value - 1 : currentQuestionIndex;
        break;
      case 'reset':
        setCurrentQuestionIndex(0);
        return;
    }
    if (newIndex >= 0 && newIndex < filteredQuestions.length) {
      setCurrentQuestionIndex(newIndex);
    }
  };

  const handleToggleFavorites = (questionId: number) => {
    fetch(`${backendUrl}/toggleFavorite`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question_id: questionId })
    })
    .then(response => response.json())
    .then(() => {
      setFavorites(prev => {
        const newFavorites = new Set(prev);
        let message = "";
        if (newFavorites.has(questionId)) {
          newFavorites.delete(questionId);
          message = "Removed from Favorites";
        } else {
          newFavorites.add(questionId);
          message = "Added to Favorites";
        }
        toast({
          title: message,
          status: "info",
          duration: 3000,
          isClosable: true,
          position: "bottom-right"
        });
        return newFavorites;
      });
    })
    .then(() => {
      if (selectedFilter === 'favorites') {
        setFilteredQuestions(questions.filter(question => favorites.has(question.id)));
      }
    })
    .catch(error => console.error('Error toggling favorite:', error));
  };  

  const handleDropdownChange = (value: string) => {
    setSelectedFilter(value);
    setCurrentQuestionIndex(0);
  };

  const handleOptionSelect = async (optionIndex: number | null) => {
    const questionId = filteredQuestions[currentQuestionIndex].id;
    const currentQuestion = questions.find(q => q.id === questionId);
  
    if (!currentQuestion) {
      console.error("Question not found");
      return;
    }
  
    const previouslySelectedOptionIndex = currentQuestion.options.findIndex(opt => opt === currentQuestion.userSelectedOption);
    
    let selectedOption: string | null = null;
    if (optionIndex !== null) {
      selectedOption = `Option ${String.fromCharCode(65 + optionIndex)}`;
    }
    
    const isCorrect = selectedOption === currentQuestion.answer;
    
    // Update score logic...
    if (selectedOption && previouslySelectedOptionIndex !== optionIndex) {
      const increment = isCorrect ? 1 : 0;
      await updateScore(questionId, increment);
    } else if (!selectedOption && previouslySelectedOptionIndex !== null) {
      const decrement = currentQuestion.options[previouslySelectedOptionIndex] === currentQuestion.answer ? -1 : 0;
      await updateScore(questionId, decrement);
    }
  
    await fetch(`${backendUrl}/updateUserSelection`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question_id: questionId, selected_option: selectedOption })
    });
  
    setQuestions(prevQuestions => prevQuestions.map(q => {
      if (q.id === questionId) {
        return { ...q, userSelectedOption: selectedOption };
      }
      return q;
    }));
  };  

const updateScore = async (questionId: number, scoreChange: number) => {
  await fetch(`${backendUrl}/updateScore`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question_id: questionId, increment: scoreChange, quiz_set_id: id })
  });
  // Fetch the updated score here if needed
};

  const { isOpen: isSearchModalOpen, onOpen: onSearchModalOpen, onClose: onSearchModalClose } = useDisclosure();
  const { isOpen: isConfirmationModalOpen, onOpen: onConfirmationModalOpen, onClose: onConfirmationModalClose } = useDisclosure();
  const { isOpen: isResetModalOpen, onOpen: onResetModalOpen, onClose: onResetModalClose } = useDisclosure();

  const { colorMode, toggleColorMode } = useColorMode();
  const iconBg = useColorModeValue('white', 'transparent');
  const iconHoverBg = useColorModeValue('#edf2f8', '#2c323d');
  const cardBgColor = useColorModeValue('gray.50', 'gray.700');
  const cardTextColor = useColorModeValue('black', 'white');

  const defaultQuestion: Question = {
    id: 0,
    question: "Question",
    options: ["A. Option A", "B. Option B", "C. Option C", "D. Option D"],
    answer: "Correct Answer",
    url: "Placeholder URL",
    explanation: "Placeholder Explanation",
    discussion_link: "Placeholder Discussion Link",
    userSelectedOption: null,
    hasMathContent: false,
  };  

  const isQuestionAvailable = currentQuestionIndex < filteredQuestions.length;
  const displayedQuestion = isQuestionAvailable ? filteredQuestions[currentQuestionIndex] : defaultQuestion;

  const safeUrl = displayedQuestion.url || "";
  const safeExplanation = displayedQuestion.explanation || "";

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchKeyword(e.target.value);
  };

  const onNavigateToQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
    onSearchModalClose(); // Close the search modal
  };

  const handleSubmit = () => {
    const unansweredQuestions = questions.filter(q => q.userSelectedOption === null);

    if (unansweredQuestions.length > 0) {
        setUnansweredQuestions(unansweredQuestions);
        setIsUnansweredQuestionsModalOpen(true);
    } else {
        calculateAndShowSummary();
    }
  };

  const calculateAndShowSummary = () => {
    const calculatedScore = questions.reduce((acc, question) => {
      const correct = question.userSelectedOption === question.answer;
      return acc + (correct ? 1 : 0);
    }, 0);
  
    console.log(`Calculated Score: ${calculatedScore}`);
    setScore(calculatedScore);
    updateScoreInDatabase(calculatedScore); // Update score in database
  
    const passingScore = 70; // Define your passing score threshold
    const newStatus = calculatedScore / questions.length >= passingScore / 100 ? 'Passed' : 'Failed';
    updateQuizSetStatus(newStatus); // Update the status in the backend
    setIsSummaryModalOpen(true);
  };

  const updateQuizSetStatus = async (status: string) => {
    try {
      await fetch(`${backendUrl}/updateQuizSetStatus/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
    } catch (error) {
      console.error('Error updating quiz set status:', error);
    }
  };
  
  const updateScoreInDatabase = (score: number) => {
    // Assuming you have an endpoint to update the score
    fetch(`${backendUrl}/updateQuizSetScore/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ score })
    })
    .then(response => response.json())
    .then(data => console.log('Score updated in database:', data))
    .catch(error => console.error('Error updating score:', error));
  };  

  const onSubmitWithUnanswered = () => {
    setIsUnansweredQuestionsModalOpen(false);
    calculateAndShowSummary();
  };

  const navigateToIncorrect = (navigateToQuestion: NavigateToQuestionFunction) => {
    setSelectedFilter('incorrect');
    navigateToQuestion(0);
    setIsSummaryModalOpen(false);
  };

  useEffect(() => {
    let filtered;
    switch (selectedFilter) {
        case 'favorites':
            filtered = questions.filter(question => favorites.has(question.id));
            break;
        case 'answered':
            filtered = questions.filter(q => q.userSelectedOption !== null);
            break;
        case 'unanswered':
            filtered = questions.filter(q => q.userSelectedOption === null);
            break;
        case 'incorrect':
            filtered = questions.filter(q => q.userSelectedOption !== q.answer);
            break;
        default:
            filtered = [...questions];
    }
    setFilteredQuestions(filtered);
  }, [questions, favorites, selectedFilter]);

  const getQuestionIndex = (questionId: number, filter: string) => {
    let list;
    switch (filter) {
        case 'favorites':
            list = questions.filter(q => favorites.has(q.id));
            break;
        case 'answered':
            list = questions.filter(q => q.userSelectedOption !== null);
            break;
        case 'unanswered':
            list = questions.filter(q => q.userSelectedOption === null);
            break;
        default:
            list = questions;
    }
    // Find the index in the filtered list and return it as is (zero-based)
    return list.findIndex(q => q.id === questionId);
  };

  const handleReset = async () => {
    console.log("Initiating reset");
    try {
      const response = await fetch(`${backendUrl}/resetQuestions/${id}`, {
        method: 'POST'
      });
      if (!response.ok) throw new Error('Network response was not ok');
  
      console.log("Reset successful, refetching questions");
      await fetchQuestionsAndUpdateSelections();
  
      setCurrentQuestionIndex(0);
  
      onResetModalClose();
  
      toast({
        title: "Questions Reset",
        description: "All questions and answers have been reset.",
        status: "info",
        duration: 3000,
        isClosable: true,
        position: "bottom-right"
      });
    } catch (error) {
      console.error('Error resetting questions:', error);
    }
  };  

  // Keyboard event handlers
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if the target is the input for question navigation
      if (document.activeElement?.tagName === 'INPUT') {
        return; // Do not execute keyboard shortcuts when typing in input
      }

      switch (event.key) {
        case ' ':
          event.preventDefault(); // Prevent scrolling on space key
          handleFlipCard(); // Flip card
          break;
        case 'ArrowLeft':
          handleNavigate('prev'); // Go to previous question
          break;
        case 'ArrowRight':
          handleNavigate('next'); // Go to next question
          break;
        default:
          break; // Do nothing for other keys
      }
    };

    // Attach the event listener
    window.addEventListener('keydown', handleKeyDown);

    // Cleanup function to remove the event listener
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentQuestionIndex, filteredQuestions.length]); // Dependencies for useEffect

  // Function to toggle Flip Card visibility and icon state
  const toggleFlipCardVisibility = () => {
    const newState = eyeIcon === 'open' ? 'none' : 'open';
    fetch(`${backendUrl}/updateEyeIconState/${id}`, {  // Use quiz set ID
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ state: newState === 'open' })
    }).then(() => {
      setEyeIcon(newState);
      setShowFlipCard(newState === 'open');
      setIsCardFlipped(newState !== 'open');
    });
  };

  return (
    <LoadingLayout key={selectedFilter}>
      <Box p={4}>
        {/* Parent Container */}
        <Flex flexDirection="column" alignItems="center">
          
          {/* Top Section with Left and Right Parts */}
          <Flex justifyContent="space-between" alignItems="center" width="100%" marginBottom={4}>
            
            {/* Left Part with back and reset buttons */}
            <Flex alignItems="center" gap={2}>
              <Tooltip label="Go Back" aria-label="Go Back Tooltip">
                <IconButton
                  aria-label="Go back"
                  icon={<ExitIcon style={{ transform: 'scaleX(-1)', width: '20px', height: '20px' }} />}
                  onClick={() => router.push('/Dashboard')}
                  backgroundColor="transparent"
                  _hover={{ backgroundColor: iconHoverBg }}
                />
              </Tooltip>
              <Tooltip label="Reset" aria-label="Reset Tooltip">
                <IconButton
                  aria-label="Reset"
                  icon={<UpdateIcon style={{ width: '20px', height: '20px' }} />}
                  onClick={onResetModalOpen}
                  backgroundColor="transparent"
                  _hover={{ backgroundColor: iconHoverBg }}
                />
              </Tooltip>
              {/* Eye Icon for toggling Flip Card and Additional Info */}
              <Tooltip label={eyeIcon === 'open' ? "Hide Flip Card" : "Show Flip Card"} aria-label="Toggle Flip Card Visibility Tooltip">
                <IconButton
                  aria-label="Toggle Flip Card Visibility"
                  icon={eyeIcon === 'open' ? <EyeOpenIcon style={{ width: '20px', height: '20px' }} /> : <EyeNoneIcon style={{ width: '20px', height: '20px' }} />}
                  onClick={toggleFlipCardVisibility}
                  backgroundColor="transparent"
                  _hover={{ backgroundColor: iconHoverBg }}
                />
              </Tooltip>
              <Tooltip label="Submit" aria-label="Submit Tooltip">
                <Button
                  onClick={handleSubmit}
                  backgroundColor="transparent"
                  _hover={{ backgroundColor: iconHoverBg }}
                >
                  Submit
                </Button>
              </Tooltip>
              <Switch
                isChecked={optionsShuffled}
                onChange={handleToggleShuffleOptions}
                size="large"
                colorScheme="teal"
              />
            </Flex>

            {/* Right Part for additional options */}
            <Flex alignItems="center" gap={2}>
              <Select
                value={selectedFilter}
                onChange={(event) => handleDropdownChange(event.target.value)}
                width="180px"
              >
                <option value="all">All Questions</option>
                <option value="favorites">Favorites</option>
                <option value="incorrect">Incorrect</option>
                <option value="answered">Answered</option>
                <option value="unanswered">Unanswered</option>
              </Select>
              <Tooltip label="Favorites" aria-label="Favorites Tooltip">
                <IconButton
                  aria-label="Favorites"
                  icon={isQuestionAvailable && favorites.has(displayedQuestion.id) ? <StarFilledIcon style={{ width: '20px', height: '20px' }} /> : <StarIcon style={{ width: '20px', height: '20px' }} />}
                  onClick={() => isQuestionAvailable && handleToggleFavorites(displayedQuestion.id)}
                  backgroundColor="transparent"
                  _hover={{ backgroundColor: iconHoverBg }}
                />         
              </Tooltip>
              <Tooltip label="Shuffle" aria-label="Shuffle Tooltip">
                <IconButton 
                  aria-label="Shuffle" 
                  icon={<ShuffleIcon style={{ width: '20px', height: '20px' }} />} 
                  onClick={onConfirmationModalOpen} 
                  backgroundColor="transparent" 
                  _hover={{ backgroundColor: iconHoverBg }} 
                />
              </Tooltip>
              <Tooltip label="Search" aria-label="Search Tooltip">
                <IconButton 
                  aria-label="Search" 
                  icon={<MagnifyingGlassIcon style={{ width: '23px', height: '23px' }} />} 
                  onClick={onSearchModalOpen} 
                  backgroundColor="transparent" 
                  _hover={{ backgroundColor: iconHoverBg }} 
                />
              </Tooltip>

              {/* Theme Toggle Button */}
              <IconButton
                icon={colorMode === 'dark' ? <SunIcon style={{ width: '20px', height: '20px' }} /> : <MoonIcon style={{ width: '20px', height: '20px' }} />}
                onClick={toggleColorMode}
                aria-label="Toggle Dark Mode"
                backgroundColor={iconBg}
                _hover={{ backgroundColor: iconHoverBg }}
              />
            </Flex>
          </Flex>

    {/* Middle Part for question navigation */}
    <Flex justifyContent="center" alignItems="center" width="100%" marginBottom={4}>
      {/* Previous Button */}
      <IconButton
        aria-label="Previous"
        icon={<ArrowLeftIcon />}
        onClick={() => handleNavigate('prev')}
        backgroundColor="transparent"
        _hover={{
          backgroundColor: iconHoverBg,
          borderRadius: 'full',
          borderColor: 'transparent'
        }}
        isRound
        marginRight={2}
      />

      {/* Question Navigation Input */}
      <Input
        type="number"
        value={currentQuestionIndex + 1}
        onChange={(event) => handleNavigate('goto', Number(event.target.value))}
        width="75px"
        marginRight={2}
        fontSize="15px"
      />
      <Text marginX={2} fontSize="15px">/ {filteredQuestions.length}</Text>

      {/* Next Button */}
      <IconButton
        aria-label="Next"
        icon={<ArrowRightIcon />}
        onClick={() => handleNavigate('next')}
        backgroundColor="transparent"
        _hover={{
          backgroundColor: iconHoverBg,
          borderRadius: 'full',
          borderColor: 'transparent'
        }}
        isRound
      />
    </Flex>

  </Flex>

        {/* Question Card */}
        <QuestionDisplay
          question={displayedQuestion}
          onOptionSelect={handleOptionSelect}
          selectedOption={displayedQuestion.userSelectedOption}
          cardBgColor={cardBgColor}
          cardTextColor={cardTextColor}
          unselectedOptionBg={colorMode === 'dark' ? 'gray.600' : 'white'}
        />

        {/* Conditional rendering for Flip Card and Additional Info */}
        {showFlipCard && (
          <>
            {/* Flip Card for Answer Reveal */}
            <Flex justify="center" my={4} align="center" gap={4}>
              <FlipCard
                isFlipped={isCardFlipped}
                onClick={handleFlipCard}
                frontContent={<Box p={4}>Click to reveal answer</Box>}
                backContent={<Box p={4}>Answer: {displayedQuestion.answer}</Box>} // Ensure this reflects shuffled state
              />
            </Flex>

            {isCardFlipped && ( // Render Additional Info only if card is flipped
              <>
                <Divider my={4} />

                {/* Additional Info */}
                <AdditionalInfo
                  url={safeUrl}
                  explanation={safeExplanation}
                  discussion_link={displayedQuestion.discussion_link} // Pass actual discussion link
                  question_id={displayedQuestion.id}
                  questionDetails={{
                    question_text: displayedQuestion.question,
                    options: displayedQuestion.options,
                    answer: displayedQuestion.answer,
                  }}
                />

                <Divider my={4} />
              </>
            )}
          </>
        )}

        <SearchModal
          isOpen={isSearchModalOpen}
          onClose={onSearchModalClose}
          searchKeyword={searchKeyword}
          onSearchChange={handleSearchChange}
          questions={questions}
          onNavigateToQuestion={onNavigateToQuestion}
          favorites={favorites}
          currentFilter={selectedFilter}
          getQuestionIndex={(questionId) => getQuestionIndex(questionId, selectedFilter)}
        />

        <UnansweredQuestionsModal
            isOpen={isUnansweredQuestionsModalOpen}
            onClose={() => setIsUnansweredQuestionsModalOpen(false)}
            unansweredQuestions={unansweredQuestions}
            navigateToQuestion={onNavigateToQuestion}
            favorites={favorites}
            setSelectedFilter={setSelectedFilter}
            onSubmitWithUnanswered={onSubmitWithUnanswered}
            currentFilter={selectedFilter}
            getQuestionIndex={(questionId) => getQuestionIndex(questionId, selectedFilter)}
        />

        <SummaryModal
            isOpen={isSummaryModalOpen}
            onClose={() => setIsSummaryModalOpen(false)}
            score={score}
            totalQuestions={questions.length}
            navigateToIncorrect={() => navigateToIncorrect(onNavigateToQuestion)}
            incorrectQuestionsCount={questions.filter(q => q.userSelectedOption !== q.answer).length}
        />

        {/* Confirmation Modal */}
        <ConfirmationModal 
            isOpen={isConfirmationModalOpen} 
            onClose={onConfirmationModalClose} 
            onConfirm={confirmShuffleQuestions}
        />

        {/* Reset Questions Modal */}
        <ResetModal
          isOpen={isResetModalOpen}
          onClose={onResetModalClose}
          onReset={handleReset}
        />
      </Box>
    </LoadingLayout>
  );  
}

export default QuizModePage;