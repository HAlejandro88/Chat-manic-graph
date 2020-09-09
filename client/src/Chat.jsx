import React, { useState } from 'react';

import { 
        ApolloClient, 
        InMemoryCache, 
        ApolloProvider,
        useSubscription,
        useMutation,
        gql
       } from '@apollo/client';

import { WebSocketLink } from '@apollo/client/link/ws';
import { Container, Row, Col, FormInput, Button } from 'shards-react';

const link = new WebSocketLink({
    uri: `ws://localhost:4000/`,
    options: {
        reconnect: true
    },
});

const client = new ApolloClient({
    link,
    uri: 'http://localhost:4000',
    cache: new InMemoryCache()
});

const GET_MESSAGES = gql`
    subscription {
        messages{
        id
        user
        content
        }
    }
`;


const POST_MESSAGES = gql`
    mutation ($user: String!, $content: String!) {
        postMessage(user:$user, content: $content)
    }
`;

const Messages = ({ user }) => {
    const { data } = useSubscription(GET_MESSAGES);
    if (!data) {
        return null;
    }
    return (
        <>
            { data.messages.map(({ id, user: messageUser, content }) => (
                <div style={{display: 'flex', justifyContent: user === messageUser ? 'flex-end' : 'flex-start', paddingBottom: '1em'}}>
                    { user !== messageUser && (
                        <div style={{height: 50, width: 50, marginRight: '0.5em', border: '2px solid #e5e6ea', borderRadius: 25, textAlign: 'center', fontSize: '18pt', paddingTop:5 }}>
                            {messageUser.slice(0,2).toUpperCase()}
                        </div>
                    )}
                    <div style={{background: user === messageUser ? '#58bf56' : '#e5e6ea', color: user === messageUser ? 'white' : 'black', padding: '1em', borderRadius:'1em', maxWidth:'60%'}}>
                        {content}
                    </div>
                </div>
            ))}
        </>
    )
}

const Chat = () => {
    const [state, setState] = useState({
        user: 'Alex',
        content: ''
    });

    const { user, content } = state;


    const [postMessage] = useMutation(POST_MESSAGES)

    const onSend = () => {
        if (content.length > 0) {
            postMessage({
                variables: {user, content}
            })
        }
        setState({
            ...state,
            content: ''
        })
    }

    const opkey = e => {
        if (e.keyCode === 13) {
            onSend();
        }
    }

    return (
        <Container>
            <Messages user={ user } />
            <Row>
                <Col xs={ 2 } style={{ padding: 0 }}>
                    <FormInput 
                        label="User" 
                        value={ user } 
                        onChange={(e) => setState({...state, user: e.target.value})} />
                </Col>
                <Col xs={ 8 } style={{ padding: 0 }}>
                    <FormInput 
                        label="Content" 
                        value={ content } 
                        onChange={(e) => setState({...state, content: e.target.value})}
                        onKeyUp={ opkey } />
                </Col>
                <Col xs={ 2 } style={{ padding: 0 }}>
                    <Button onClick={ onSend } style={{ width: "100%" }}>
                        Send
                    </Button>
                </Col>
            </Row>
        </Container>
    )
}

export default () => (
    <ApolloProvider client={client}>
        <Chat />
    </ApolloProvider>
)
