import React, { useState } from 'react';
import { handleUserInput } from '../../Utilities/api';

const UserChat = ({ selectedUser }) => {
  const [userInput, setUserInput] = useState('');
  const [submittedText, setSubmittedText] = useState('');
  const [queryResponse, setQueryResponse] = useState('');

  const handleInputChange = (event) => {
    setUserInput(event.target.value);
  };

  const handleQuestionSubmit = async (event) => {
    event.preventDefault();
    setSubmittedText(userInput);
    setUserInput('');
    console.log('Submitted text:', userInput);
    const response = await handleUserInput(selectedUser._id, userInput);
    console.log('vector response:', response.gptResponse);
    setQueryResponse(response.gptResponse);
  };

  return (
    <div>
      <div className="user-input-section" style={{ marginTop: '20px' }}>
        <h2>Ask a Question</h2>
        <form onSubmit={handleQuestionSubmit}>
          <input
            type="text"
            value={userInput}
            onChange={handleInputChange}
            placeholder="Type your question here..."
            style={{
              marginTop: '10px',
              backgroundColor: 'lightblue',
              color: 'black',
              padding: '10px',
              borderRadius: '5px',
              width: '300px',
              wordWrap: 'break-word',
            }}
          />
          <button type="submit" style={{ padding: '10px 20px' }}>
            Submit
          </button>
        </form>
      </div>

      <div>
        <h2>Query Response</h2>
        {queryResponse !== '' && <p>{queryResponse}</p>}
      </div>
    </div>
  );
};

export default UserChat;