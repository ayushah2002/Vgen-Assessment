import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Colours, Typography } from '../definitions';
import Button from '../components/Button';
import PageLayout from '../components/PageLayout';
import { updateTodoError, updateTodoSuccess, updateTodoName } from '../actions/todo';
import Link from 'next/link';
import apiFetch from '../functions/apiFetch';
import { useDispatch, useSelector } from 'react-redux';
import Tabs from '../components/Tabs';


const Todos = () => {
    const dispatch = useDispatch();
    const [todosList, setTodosList] = useState([]);
    const [currentTab, setCurrentTab] = useState('Incomplete');
    const [statusUpdated, setStatusUpdated] = useState(false);

    // function that renders a list of todos
    const renderTodoList = (todos) => {
        if (todos.length === 0) {
            return <HappyMessage>You have finished all your tasks! Time to celebrate!</HappyMessage>;
        }
        return todos.sort((a, b) => new Date(b.created) - new Date(a.created))
                    .map((todo) => (
                        <TodoItem key={todo._id}>
                            <Column>
                                <input
                                    type="text"
                                    value={todo.name}
                                    onChange={(e) => handleNameChange(todo._id, e.target.value)}
                                    onBlur={() => updateName(todo._id, todo.name)}
                                    style={{ border: '1px solid lightgray', padding: '0.5rem', borderRadius: '4px' }}
                                />
                            </Column>
                            <Column>
                                <label className="switch">
                                    <input 
                                    type="checkbox"
                                    checked={todo.isComplete} 
                                    onChange={() => updateTodoStatus(todo._id, todo.isComplete)}
                                    />
                                    <span className="slider"></span>
                                </label>
                            </Column>
                        </TodoItem>
                    ));
    }

    const tabs = [
        {
            title: 'Incomplete',
            content: (
                <TodoList>
                    <TodoHeader>
                        <HeaderColumn>Todo Name</HeaderColumn>
                        <HeaderColumn>Status</HeaderColumn>
                    </TodoHeader>
                    { renderTodoList(todosList.filter(todo => !todo.isComplete)) }
                </TodoList>
            ),
            onClick: () => setCurrentTab('Incomplete'),
        },
        {
            title: 'All',
            content: (
                <TodoList>
                    <TodoHeader>
                        <HeaderColumn>Todo Name</HeaderColumn>
                        <HeaderColumn>Status</HeaderColumn>
                    </TodoHeader>
                    { renderTodoList(todosList) }
                </TodoList>
            ),
            onClick: () => setCurrentTab('All'),
        }
    ]

    // database toggle of isComplete status
    const updateTodoStatus = async (id, currStatus) => {
        const response = await apiFetch(`/todo/${id}`, {
            method: "PATCH",
            body: { isComplete: !currStatus }
        })

        if (response.status === 200) {
            const updatedTodo = response.body;
            dispatch(updateTodoSuccess({ success: `Todo "${updatedTodo.name}" updated successfully` }));
            setStatusUpdated(!statusUpdated);
        } else {
            dispatch(updateTodoError({ error: response.body.error }))
        }
    }

    // input field name change (need this to keep track of new name)
    const handleNameChange = (id, newName) => {
        setTodosList(todosList.map(todo => todo._id === id ? { ...todo, name: newName } : todo));
    }

    // Update database with new todo name
    const updateName = async (id, newName) => {
        const response = await apiFetch(`/todo/${id}`, {
            method: "PATCH",
            body: { name: newName }
        })

        if (response.status === 200) {
            const updatedTodo = response.body;
            dispatch(updateTodoSuccess({ success: `Todo "${updatedTodo.name}" updated successfully` }));
            setStatusUpdated(!statusUpdated);
        } else {
            dispatch(updateTodoError({ error: response.body.error }))
        }
    }

    useEffect(() => {
        const fetchTodosList = async () => {
            let response = await apiFetch("/todo", {
                method: "GET"
            })
            if (response.status === 200) {
                if(response.body.todosList) {
                    setTodosList(response.body.todosList)
                }
            } else {
                dispatch(updateTodoError({ error: response.body.error}));
            }
        }

        fetchTodosList()
    }, [statusUpdated]);

    return (
        <PageLayout title="Manage Todos">
            <Tabs tabs={tabs} activeTab={currentTab} />
            <Link className="noLinkStyling" href="/create">
                <Button 
                    text="Create a task" 
                    size="medium"
                    isFullWidth={true}
                    style={{
                        backgroundColor: 'lightgreen',
                        marginTop: '12px'
                    }} 
                />
            </Link>
        </PageLayout>
    );
};

export default Todos;

const TodoList = styled.ul`
    margin-top: 2rem;
`;

const TodoHeader = styled.div`
    display: flex;
    justify-content: space-between;
    font-weight: bold;
    border-bottom: 2px solid darkgreen;
    padding: 0.5rem 0;
`;

const TodoItem = styled.li`
    border-bottom: 1px solid ${Colours.GRAY};
    padding: 0.5rem 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const Column = styled.div`
    flex: 1;
    text-align: left
    &:first-child {
        flex: 2;
    }
`

const HeaderColumn = styled(Column)`
    text-align: left;
    font-size: ${Typography.FONTS.HEADING_SIZES};
    font-weight: ${Typography.WEIGHTS.REGULAR};
    color: darkgreen;
    margin-right: 12px;
`;

const HappyMessage = styled.div`
    text-align: center;
    margin-top: 2rem;
    font-size: 1.2rem;
    color: skyblue;
`;