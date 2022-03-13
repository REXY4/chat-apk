// import hook
import React, { useState, useEffect, useContext } from 'react';

import NavbarAdmin from '../components/NavbarAdmin';

import { Container, Row, Col } from 'react-bootstrap';
import Contact from '../components/complain/Contact';

// import here
import Chat from '../components/complain/Chat';

import { UserContext } from '../context/userContext';

// import socket.io-client
import { io } from 'socket.io-client';

// initial variable outside socket
let socket;
export default function ComplainAdmin() {
  const [contact, setContact] = useState(null);
  const [contacts, setContacts] = useState([]);
  // code here
  const [messages, setMessages] = useState([]);

  const title = 'Complain admin';
  document.title = 'DumbMerch | ' + title;

  // code here
  const [state] = useContext(UserContext);

  useEffect(() => {
    socket = io('http://localhost:5000', {
      auth: {
        token: localStorage.getItem('token'),
      },
      query: {
        id: state.user.id,
      },
    });

    socket.on('new message', () => {
      socket.emit('load messages', contact?.id);
    });

    loadContacts();
    loadMessages();

    return () => {
      socket.disconnect();
    };
  }, [messages]); // code here

  const loadContacts = () => {
    socket.emit('load customer contacts');
    socket.on('customer contacts', (data) => {
      // filter just customers which have sent a message
      let dataContacts = data.map((item) => ({
        ...item,
        message:
          messages.lenght > 0
            ? messages[messages.length - 1].message
            : 'Click here to start message',
      }));
      setContacts(dataContacts);
    });
  };

  // used for active style when click contact
  const onClickContact = (data) => {
    setContact(data);
    socket.emit('load messages', data.id);
  };

  const loadMessages = () => {
    socket.on('messages', async (data) => {
      if (data.length > 0) {
        const dataMessages = data.map((item) => ({
          idSender: item.sender.id,
          message: item.message,
        }));
        loadContacts();
        setMessages(dataMessages);
      }
    });
  };

  const onSendMessage = (e) => {
    if (e.key === 'Enter') {
      const data = {
        idRecipient: contact.id,
        message: e.target.value,
      };

      socket.emit('send message', data);
      e.target.value = '';
    }
  };

  return (
    <>
      <NavbarAdmin title={title} />
      <Container fluid style={{ height: '89.5vh' }}>
        <Row>
          <Col
            md={3}
            style={{ height: '89.5vh' }}
            className="px-3 border-end border-dark overflow-auto"
          >
            <Contact
              dataContact={contacts}
              clickContact={onClickContact}
              contact={contact}
            />
          </Col>
          <Col md={9} style={{ height: '89.5vh' }} className="px-0">
            <Chat
              contact={contact}
              messages={messages}
              user={state.user}
              sendMessage={onSendMessage}
            />
          </Col>
        </Row>
      </Container>
    </>
  );
}
