// pages/index.tsx
import React, { useState } from 'react';
import {
  Box,
  Text,
  Center,
  VStack,
  Button,
  Divider,
  useColorModeValue,
  Stack,
  Grid,
  GridItem,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  List,
  ListItem,
  ListIcon,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Code,
  Flex,
  SkeletonCircle,
  SkeletonText,
} from '@chakra-ui/react';
import { ChevronRightIcon } from '@chakra-ui/icons';
import { MdCheckCircle } from 'react-icons/md';
import Link from 'next/link';
import { Link as ChakraLink } from '@chakra-ui/react';
import Navbar from '../components/Navbar';
import LoadingLayout from '../components/LoadingLayout';
import { useRouter } from 'next/router';

type CustomSkeletonComponentProps = {
  width: string;
};

const CustomSkeletonComponent: React.FC<CustomSkeletonComponentProps> = ({ width }) => (
  <Box mt={2} mb={5}>
    <Stack direction="row" spacing="4" alignItems="center">
      <SkeletonCircle size="4" />
      <SkeletonText w={width} noOfLines={1} />
    </Stack>
  </Box>
);

export default function HomePage() {
  const [tabIndex, setTabIndex] = React.useState(0);
  const router = useRouter();

  const studyModeSkeletonWidths = ['80%', '70%', '65%', '45%', '25%', '50%'];
  const quizModeSkeletonWidths = ['50%', '60%', '54%', '52.5%', '65%', '85%'];

  return (
    <LoadingLayout>
      <>
        <Navbar />
        <VStack spacing={[2, 4, 6]} mt={[5, 10]} align="stretch">
          <Center>
            <VStack spacing={0}>
              <Text
                fontSize={['2xl', '3xl', '4xl', '5xl']}
                fontWeight="bold"
                color={useColorModeValue('gray.800', 'white')}
                m={0}
                textAlign="center"
              >
                Discover, simplify, excel.
              </Text>
              <Text
                fontSize={['2xl', '3xl', '4xl', '5xl']}
                fontWeight="bold"
                color={useColorModeValue('gray.800', 'white')}
                m={0}
                textAlign="center"
              >
                With athena by your side.
              </Text>
            </VStack>
          </Center>
          <Center>
            <Text
              fontSize={['lg', 'xl', '2xl']}
              fontWeight="bold"
              color={useColorModeValue('gray.600', 'gray.200')}
              textAlign="center"
            >
              Streamlined quizzes from multiple sources, for effortless bulk answering.
            </Text>
          </Center>
          <Divider my={[2, 4]} w={['80%', '70%', '60%', '50%']} alignSelf="center" />

          <Center>
            <Stack direction={['column', 'row']} spacing={3} align="center">
              <Button
                variant="outline"
                borderColor={useColorModeValue('black', 'white')}
                _hover={{
                  bg: useColorModeValue('black', 'white'),
                  color: useColorModeValue('white', 'black'),
                }}
              >
                Study Mode
              </Button>

              <Button
                rightIcon={<ChevronRightIcon />}
                bg={useColorModeValue('black', 'white')}
                color={useColorModeValue('white', 'black')}
                _hover={{ bg: useColorModeValue('gray.700', 'gray.300') }}
                onClick={() => router.push('/Dashboard')}
              >
                Go to Dashboard
              </Button>

              <Link href="/QuizModePage" passHref>
                <Button
                  as="a"
                  variant="outline"
                  borderColor={useColorModeValue('black', 'white')}
                  _hover={{
                    bg: useColorModeValue('black', 'white'),
                    color: useColorModeValue('white', 'black'),
                  }}
                >
                  Quiz Mode
                </Button>
              </Link>
            </Stack>
          </Center>

          <Center my={4}>
            <Box w={['95%', '90%', '80%']} mx="auto">
              <Tabs isFitted variant="enclosed" onChange={(index) => setTabIndex(index)}>
                <TabList mb="1em">
                  <Tab>Study Mode</Tab>
                  <Tab>Quiz Mode</Tab>
                </TabList>
                <TabPanels>
                  <TabPanel>
                    {/* Content for Study Mode */}
                  </TabPanel>
                  <TabPanel>
                    {/* Content for Quiz Mode */}
                  </TabPanel>
                </TabPanels>
              </Tabs>

              <Grid
                templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }}
                gap={6}
              >
                {/* Study Mode - Left Column */}
                <GridItem w="100%">
                  {tabIndex === 0 ? (
                    <List spacing={3}>
                      <ListItem>
                        <ListIcon as={MdCheckCircle} color="green.500" />
                        Input fields for base URL and start/end URL numbers
                      </ListItem>
                      <ListItem>
                        <ListIcon as={MdCheckCircle} color="green.500" />
                        Flashcard-style question and answer display
                      </ListItem>
                      <ListItem>
                        <ListIcon as={MdCheckCircle} color="green.500" />
                        Navigation buttons (Previous and Next)
                      </ListItem>
                      <ListItem>
                        <ListIcon as={MdCheckCircle} color="green.500" />
                        Mark questions as favorites
                      </ListItem>
                      <ListItem>
                        <ListIcon as={MdCheckCircle} color="green.500" />
                        Shuffle questions
                      </ListItem>
                      <ListItem>
                        <ListIcon as={MdCheckCircle} color="green.500" />
                        Question counter (e.g., "Question 1 / 5")
                      </ListItem>
                    </List>
                  ) : (
                    studyModeSkeletonWidths.map((width, index) => (
                      <CustomSkeletonComponent key={index} width={width} />
                    ))
                  )}
                </GridItem>

                {/* Quiz Mode - Right Column */}
                <GridItem w="100%">
                  {tabIndex === 1 ? (
                    <List spacing={3}>
                      <ListItem>
                        <ListIcon as={MdCheckCircle} color="green.500" />
                        Same features as Study Mode
                      </ListItem>
                      <ListItem>
                        <ListIcon as={MdCheckCircle} color="green.500" />
                        Scoring system for quiz assessment
                      </ListItem>
                      <ListItem>
                        <ListIcon as={MdCheckCircle} color="green.500" />
                        Submit button for score calculation
                      </ListItem>
                      <ListItem>
                        <ListIcon as={MdCheckCircle} color="green.500" />
                        Warning for unanswered questions
                      </ListItem>
                      <ListItem>
                        <ListIcon as={MdCheckCircle} color="green.500" />
                        Option to answer unanswered questions
                      </ListItem>
                      <ListItem>
                        <ListIcon as={MdCheckCircle} color="green.500" />
                        Summary display with score and incorrect answers
                      </ListItem>
                    </List>
                  ) : (
                    quizModeSkeletonWidths.map((width, index) => (
                      <CustomSkeletonComponent key={index} width={width} />
                    ))
                  )}
                </GridItem>
              </Grid>
            </Box>
          </Center>

          <Center my={2}>
            <Box w={['95%', '90%', '80%']} mx="auto">
              <Text
                fontSize={['2xl', '3xl', '4xl']}
                fontWeight="bold"
                color={useColorModeValue('gray.800', 'white')}
                textAlign="center"
              >
                Instructions:
              </Text>
              <Accordion allowMultiple>
                <AccordionItem>
                  <AccordionButton>
                    <Box flex="1" textAlign="left" fontWeight="bold">
                      Step 1: Clone and Run
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                  <AccordionPanel pb={4}>
                    First, clone the repository and navigate to the project directory:
                    <br />
                    <Center my={2}>
                      <pre>
                        <Code whiteSpace="pre-wrap">
                          git clone https://github.com/rsduran/athena-cli.git
                        </Code>
                      </pre>
                    </Center>
                    <Center mt={2}>
                      <pre>
                        <Code whiteSpace="pre-wrap">cd athena-cli</Code>
                      </pre>
                    </Center>
                  </AccordionPanel>
                </AccordionItem>

                <AccordionItem>
                  <AccordionButton>
                    <Box flex="1" textAlign="left" fontWeight="bold">
                      Step 2: Install Dependencies
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                  <AccordionPanel pb={4}>
                    Next, install the required dependencies using the following command:
                    <br />
                    <Center mt={2}>
                      <pre>
                        <Code whiteSpace="pre-wrap">pip install -r requirements.txt</Code>
                      </pre>
                    </Center>
                  </AccordionPanel>
                </AccordionItem>

                <AccordionItem>
                  <AccordionButton>
                    <Box flex="1" textAlign="left" fontWeight="bold">
                      Step 3: Run Athena-CLI and Initiate Local Server
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                  <AccordionPanel pb={4}>
                    Open a terminal or command prompt window, navigate to the athena-cli directory,
                    and run the following command to start Athena-CLI:
                    <br />
                    <Center my={2}>
                      <pre>
                        <Code whiteSpace="pre-wrap">python main.py</Code>
                      </pre>
                    </Center>
                    Next, open another terminal or command prompt and initiate a local server using
                    the following command:
                    <br />
                    <Center mt={2}>
                      <pre>
                        <Code whiteSpace="pre-wrap">python -m http.server 8000</Code>
                      </pre>
                    </Center>
                  </AccordionPanel>
                </AccordionItem>

                <AccordionItem>
                  <AccordionButton>
                    <Box flex="1" textAlign="left" fontWeight="bold">
                      Step 4: Input URLs
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                  <AccordionPanel pb={4}>
                    Make sure to input URLs in the following format: [base_url], [start_url],
                    [end_url]. For example:
                    <br />
                    <Center my={2}>
                      <pre>
                        <Code whiteSpace="pre-wrap">
                          https://www.indiabix.com/electronics-and-communication-engineering/networks-analysis-and-synthesis/,
                          026001, 026010
                        </Code>
                      </pre>
                    </Center>
                    In this one URL, you’ll have a total of 50 questions loaded to the web app, as
                    each URL number in IndiaBIX typically has 5 questions.
                  </AccordionPanel>
                </AccordionItem>
              </Accordion>
            </Box>
          </Center>

          {/* Footer Bar */}
          <Divider my={[2, 4]} />
          <Flex as="footer" w="full" py={2} alignItems="center" justifyContent="center">
            <Text
              fontSize="sm"
              textAlign="center"
              color={useColorModeValue('gray.600', 'gray.200')}
            >
              Built by{' '}
              <ChakraLink
                href="https://github.com/rsduran"
                isExternal
                textDecoration="underline"
                color={useColorModeValue('black', 'white')}
              >
                rsduran
              </ChakraLink>
              . The source code is available on{' '}
              <ChakraLink
                href="https://github.com/rsduran/athena-cli"
                isExternal
                textDecoration="underline"
                color={useColorModeValue('black', 'white')}
              >
                Github
              </ChakraLink>
              .
            </Text>
          </Flex>
        </VStack>
      </>
    </LoadingLayout>
  );
}