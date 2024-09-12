export const handlePrevQuestion = (currentQuestionIndex: number, setCurrentQuestionIndex: React.Dispatch<React.SetStateAction<number>>) => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prevIndex => prevIndex - 1);
    }
  };
  
  export const handleNextQuestion = (currentQuestionIndex: number, questionsLength: number, setCurrentQuestionIndex: React.Dispatch<React.SetStateAction<number>>) => {
    if (currentQuestionIndex < questionsLength - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
    }
  };
  
  // Add other question handling functions here  