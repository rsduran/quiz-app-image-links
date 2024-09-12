// DynamicQuizTable.tsx

import React, { useState, useEffect, KeyboardEvent, ChangeEvent } from 'react';
import {
  Input, Box, Table, Thead, Tbody, Tr, Th, Td,
  Link, CircularProgress, CircularProgressLabel,
  Badge, Checkbox, useColorModeValue, Stat, StatLabel, StatNumber, StatHelpText, StatArrow, IconButton, useDisclosure, Flex
} from '@chakra-ui/react';
import { AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader, AlertDialogContent, AlertDialogOverlay, Button } from '@chakra-ui/react';
import { OpenInNewWindowIcon, Pencil2Icon, TrashIcon, LockClosedIcon, LockOpen1Icon } from '@radix-ui/react-icons';
import UrlsModal from '../components/UrlsModal';

interface QuizSet {
    id: string;
    title: string;
    urls: string[];
    progress: number;
    score: number;
    total_questions: number;
    grade: string;
    status: string;
    lockState: boolean;
}

interface UrlGroups {
    [baseUrl: string]: {
        [prefix: string]: {
            start: string;
            end: string;
        };
    };
}

const DynamicQuizTable = () => {
  const [quizSets, setQuizSets] = useState<QuizSet[]>([]);
  const [checkedItems, setCheckedItems] = useState<{ [key: string]: boolean }>({});
  const [selectedUrls, setSelectedUrls] = useState<string[]>([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState<string>('');
  const [hoveredTitleId, setHoveredTitleId] = useState<string | null>(null);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [deleteQuizSetId, setDeleteQuizSetId] = useState<string | null>(null);
  const cancelRef = React.useRef<HTMLButtonElement>(null);
  const [isLocked, setIsLocked] = useState(true);
  
  // Fetch quiz sets data
  const fetchQuizSets = async () => {
    try {
      const response = await fetch('http://localhost:5000/getQuizSets');
      if (!response.ok) throw new Error('Network response was not ok');
      
      const quizSetsData = await response.json();
      const updatedQuizSets = await Promise.all(quizSetsData.map(async (quizSet: QuizSet) => {
        const detailsResponse = await fetch(`http://localhost:5000/getQuizSetDetails/${quizSet.id}`);
        const details = await detailsResponse.json();
  
        const scoreResponse = await fetch(`http://localhost:5000/getQuizSetScore/${quizSet.id}`);
        const scoreData = await scoreResponse.json();
  
        // Fetch lock state
        const lockStateResponse = await fetch(`http://localhost:5000/getLockState/${quizSet.id}`);
        const lockStateData = await lockStateResponse.json();
  
        return {
          ...quizSet,
          urls: details.urls,
          progress: details.progress,
          score: scoreData.score,
          total_questions: scoreData.total_questions,
          grade: calculateGrade(scoreData.score, scoreData.total_questions),
          status: calculateStatus(scoreData.score, scoreData.total_questions),
          lockState: lockStateData.lock_state // Set lock state
        };
      }));
      setQuizSets(updatedQuizSets);
    } catch (error) {
      console.error('Error fetching quiz sets:', error);
    }
  };

  useEffect(() => {
    // Load checked state from localStorage
    const savedCheckedItemsJSON = localStorage.getItem('checkedItems');
    const savedCheckedItems = savedCheckedItemsJSON ? JSON.parse(savedCheckedItemsJSON) : {};
    setCheckedItems(savedCheckedItems);
  
    // Fetch quiz sets
    fetchQuizSets();
  
    // Fetch the initial lock state from the backend
    const fetchLockState = async () => {
      try {
        const response = await fetch('http://localhost:5000/getLockState/global'); // Assuming 'global' as a key for global lock state
        const data = await response.json();
        setIsLocked(data.lock_state);
      } catch (error) {
        console.error('Error fetching lock state:', error);
      }
    };
  
    fetchLockState();
  }, []);  
  
  const calculateGrade = (score: number, totalQuestions: number) => {
    const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
    return percentage >= 70 ? 'Passed' : 'Failed';
  };
  
  const calculateStatus = (score: number, totalQuestions: number) => {
    const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
    return percentage >= 70 ? 'passed' : 'failed';
  };  

  const toggleLockState = async (quizSetId: string) => {
    // Function to toggle lock state
    try {
      const response = await fetch(`http://localhost:5000/toggleLockState/${quizSetId}`, {
        method: 'POST',
      });
      if (response.ok) {
        setQuizSets(quizSets.map(quizSet => 
          quizSet.id === quizSetId ? { ...quizSet, lockState: !quizSet.lockState } : quizSet
        ));
      }
    } catch (error) {
      console.error('Error toggling lock state:', error);
    }
  };

  const toggleLock = async () => {
    try {
        const response = await fetch('http://localhost:5000/toggleLockState/global', {
            method: 'POST',
        });
        if (response.ok) {
            const data = await response.json();
            setIsLocked(data.new_state);  // Update the state based on the response
        }
    } catch (error) {
        console.error('Error toggling global lock state:', error);
    }
  };

  const renderGradeComponent = (quizSet: QuizSet) => {
    if (isLocked) {
      return (
        <Stat>
          <StatLabel>Pending</StatLabel>
          <StatNumber>0/{quizSet.total_questions}</StatNumber>
          <StatHelpText>
            <StatArrow type='increase' />
            0%
          </StatHelpText>
        </Stat>
      );
    }
  
    // Existing logic for displaying actual grade
    const percentage = quizSet.total_questions > 0 ? Math.round((quizSet.score / quizSet.total_questions) * 100) : 0;
    const arrowType = quizSet.grade === 'Passed' ? 'increase' : 'decrease';
  
    return (
      <Stat>
        <StatLabel>{quizSet.grade}</StatLabel>
        <StatNumber>{quizSet.score}/{quizSet.total_questions}</StatNumber>
        <StatHelpText>
          <StatArrow type={arrowType} />
          {percentage}%
        </StatHelpText>
      </Stat>
    );
  };
  
  const renderBadge = (status: string, progress: number) => {
    if (progress === 0) {
      return <Badge colorScheme='purple'>New</Badge>;
    } else if (isLocked) {
      return <Badge>In Progress</Badge>;
    }

    switch (status) {
      case 'passed':
        return <Badge colorScheme='green'>Passed</Badge>;
      case 'failed':
        return <Badge colorScheme='red'>Failed</Badge>;
      default:
        return null;
    }
  };

  const processUrlsForDisplay = (urls: string[]) => {
    const urlGroups: UrlGroups = {};
    urls.forEach((url: string) => {
      const match = url.match(/(.*\/)(\d+)$/);
      if (match) {
        const [ , baseUrl, number ] = match;
        const prefix = number.substring(0, 4);
        if (!urlGroups[baseUrl]) urlGroups[baseUrl] = {};
        if (!urlGroups[baseUrl][prefix]) urlGroups[baseUrl][prefix] = { start: number, end: number };
        urlGroups[baseUrl][prefix].end = number;
      }
    });

    return Object.entries(urlGroups).flatMap(([baseUrl, groups]) => {
      return Object.values(groups).map(group => `${baseUrl}, ${group.start}, ${group.end}`);
    });
  };

  const handleOpenUrlsModal = (urls: string[]) => {
    const processedUrls = processUrlsForDisplay(urls);
    setSelectedUrls(processedUrls);
    onOpen();
  };

  const handleParentCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    const newCheckedItems = quizSets.reduce<{ [key: string]: boolean }>((acc, quizSet) => {
      acc[quizSet.id] = isChecked;
      return acc;
    }, {});
    setCheckedItems(newCheckedItems);
    localStorage.setItem('checkedItems', JSON.stringify(newCheckedItems));
  };  

  const handleChildCheckboxChange = (id: string, checked: boolean) => {
    const newCheckedItems = { ...checkedItems, [id]: checked };
    setCheckedItems(newCheckedItems);
    localStorage.setItem('checkedItems', JSON.stringify(newCheckedItems));
  }; 

  const allChecked = quizSets.length > 0 && quizSets.every(quizSet => checkedItems[quizSet.id]);
  const isIndeterminate = quizSets.some(quizSet => checkedItems[quizSet.id]) && !allChecked;

  // Function to handle the start of editing
  const handleEditStart = (quizSet: QuizSet) => {
    setEditingTitleId(quizSet.id);
    setEditingTitle(quizSet.title);
  };

  // Function to handle the change of the input field
  const handleEditChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEditingTitle(event.target.value);
  };

  // Function to handle the renaming on 'Enter' key
  const handleRename = async (quizSetId: string, newTitle: string) => {
    try {
      const response = await fetch(`http://localhost:5000/renameQuizSet/${quizSetId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ new_title: newTitle }),
      });
      if (response.ok) {
        setQuizSets(quizSets.map(qs => qs.id === quizSetId ? { ...qs, title: newTitle } : qs));
      }
      // Reset the editing state
      setEditingTitleId(null);
      setEditingTitle('');
    } catch (error) {
      console.error('Error renaming quiz set:', error);
    }
  };

  // Function to handle key press events for the input field
  const handleKeyPress = (event: KeyboardEvent<HTMLInputElement>, quizSetId: string) => {
    if (event.key === 'Enter') {
      handleRename(quizSetId, editingTitle);
    }
  };

    // Function to open delete confirmation dialog
    const onOpenDeleteAlert = (quizSetId: string) => {
        setDeleteQuizSetId(quizSetId);
        setIsDeleteAlertOpen(true);
    };
  
  // Function to handle quiz set deletion
  const handleDeleteQuizSet = async () => {
    if (deleteQuizSetId) {
      try {
        const response = await fetch(`http://localhost:5000/deleteQuizSet/${deleteQuizSetId}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          setQuizSets(quizSets.filter(qs => qs.id !== deleteQuizSetId));
          setIsDeleteAlertOpen(false);
          setDeleteQuizSetId(null);
        }
      } catch (error) {
        console.error('Error deleting quiz set:', error);
      }
    }
  };



  return (
    <Box width="80%" mx="auto" mt={5} border="1px" borderColor={borderColor} borderRadius="md" overflow="hidden">
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th width="5%">
              <Checkbox isChecked={allChecked} isIndeterminate={isIndeterminate} onChange={handleParentCheckboxChange} />
            </Th>
            <Th width="35%" textAlign="center">Quiz Set</Th>
            <Th width="15%" textAlign="center">URLs</Th>
            <Th width="15%" textAlign="center">Progress</Th>
            <Th width="15%" textAlign="center">
              <Flex alignItems="center" justifyContent="center">
                Grade
                <IconButton
                  aria-label={isLocked ? "Unlock Grades" : "Lock Grades"}
                  icon={isLocked ? <LockClosedIcon /> : <LockOpen1Icon />}
                  onClick={toggleLock}
                  bg="transparent"
                  _hover={{ color: 'blue.500' }}
                  size="sm"
                  ml={2}
                />
              </Flex>
            </Th>
            <Th width="15%" textAlign="center">Status</Th>
          </Tr>
        </Thead>
        <Tbody>
        {quizSets.map((quizSet) => (
            <Tr 
            key={quizSet.id} 
            bg={checkedItems[quizSet.id] ? useColorModeValue('gray.100', 'gray.600') : 'transparent'}
            >
            <Td><Checkbox isChecked={checkedItems[quizSet.id]} onChange={(e) => handleChildCheckboxChange(quizSet.id, e.target.checked)} /></Td>
            <Td
                onMouseEnter={() => setHoveredTitleId(quizSet.id)}
                onMouseLeave={() => setHoveredTitleId(null)}
            >
                {editingTitleId === quizSet.id ? (
                <Input
                    value={editingTitle}
                    onChange={e => setEditingTitle(e.target.value)}
                    onBlur={() => handleRename(quizSet.id, editingTitle)}
                    onKeyDown={e => handleKeyPress(e, quizSet.id)}
                    autoFocus
                    size="sm"
                />
                ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Link href={`/QuizModePage/${quizSet.id}`} isExternal>
                    {quizSet.title}
                    </Link>
                    {hoveredTitleId === quizSet.id && (
                    <IconButton
                        aria-label="Edit title"
                        icon={<Pencil2Icon style={{ width: '18px', height: '18px' }} />}
                        onClick={() => handleEditStart(quizSet)}
                        bg="transparent"
                        _hover={{ color: 'blue.500' }}
                        style={{ marginLeft: '5px' }}
                    />
                    )}
                </div>
                )}
              </Td>
              <Td textAlign="center">
                <IconButton
                  aria-label="View URLs"
                  icon={<OpenInNewWindowIcon style={{ width: '20px', height: '20px' }} />}
                  onClick={() => handleOpenUrlsModal(quizSet.urls)}
                  bg="transparent"
                  _hover={{ color: 'blue.500' }}
                />
              </Td>
              <Td textAlign="center">
                <CircularProgress value={quizSet.progress} color="teal">
                  <CircularProgressLabel>{quizSet.progress}%</CircularProgressLabel>
                </CircularProgress>
              </Td>
              <Td textAlign="center">
                {renderGradeComponent(quizSet)}
              </Td>
              <Td textAlign="center">
                {renderBadge(quizSet.status, quizSet.progress)}
              </Td>
              <Td textAlign="center">
              <IconButton
                aria-label="Delete quiz set"
                icon={<TrashIcon style={{ width: '20px', height: '20px' }} />}
                onClick={() => onOpenDeleteAlert(quizSet.id)}
                bg="transparent"
                _hover={{ color: 'blue.500' }}
              />
            </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
      <UrlsModal isOpen={isOpen} onClose={onClose} urls={selectedUrls} />
  
      <AlertDialog
        isOpen={isDeleteAlertOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => setIsDeleteAlertOpen(false)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Quiz Set
            </AlertDialogHeader>
            <AlertDialogBody>
              Are you sure? You can't undo this action afterwards.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setIsDeleteAlertOpen(false)}>
                No
              </Button>
              <Button colorScheme="red" onClick={handleDeleteQuizSet} ml={3}>
                Yes
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );  
}  

export default DynamicQuizTable;