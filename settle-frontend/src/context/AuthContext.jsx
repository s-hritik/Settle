import React, { createContext, useContext, useReducer, useEffect } from 'react';
import apiClient, { api } from '../lib/api.js'; 
import io from 'socket.io-client';
import toast from 'react-hot-toast';

const AppContext = createContext();

const initialState = {
  isAuthenticated: false,
  user: null,
  groups: [],
  expenses: {},
  loading: true,
};

function reducer(state, action) {
  switch (action.type) {
    case 'INITIALIZE':
      return { ...state, isAuthenticated: !!action.payload.user, user: action.payload.user, groups: action.payload.groups, loading: false };
    case 'LOGIN':
      return { ...state, isAuthenticated: true, user: action.payload };
    case 'LOGOUT':
      return { ...initialState, loading: false };
    case 'ADD_GROUP':
      return { ...state, groups: [action.payload, ...state.groups] };
    case 'ADD_EXPENSE': {
      const { group_id } = action.payload;
      const groupExpenses = state.expenses[group_id] || [];
      return {
        ...state,
        expenses: {
          ...state.expenses,
          [group_id]: [action.payload, ...groupExpenses],
        },
      };
    }
    case 'SET_EXPENSES_FOR_GROUP': {
        const { groupId, expenses } = action.payload;
        return {
            ...state,
            expenses: { ...state.expenses, [groupId]: expenses }
        }
    }
    case 'ADD_PAYMENT': {
        console.log("Payment recorded:", action.payload);
        return state;
    }
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    let socket;

    const checkUserStatus = async () => {
      try {
        const userRes = await apiClient.get('/users/me');
        if (userRes.data && userRes.data.data) {
          const groupsRes = await apiClient.get('/groups');
          dispatch({ type: 'INITIALIZE', payload: { user: userRes.data.data, groups: groupsRes.data.data } });
        } else {
            dispatch({type: 'LOGOUT'})
        }
      } catch (error) {
        console.log("No user is logged in.");
        dispatch({type: 'LOGOUT'})
      }
    };

    checkUserStatus();

    if (state.isAuthenticated) {
      const socketUrl = import.meta.env.VITE_API_BASE_URL.replace('/api/v1', '');
      socket = io(socketUrl);

      socket.emit('join_room', state.user.email);

      socket.on('new_group', (newGroup) => {
        dispatch({ type: 'ADD_GROUP', payload: newGroup });
        toast.success(`You've been added to a new group: ${newGroup.name}`);
      });
      
      socket.on('new_expense', (newExpense) => {
        dispatch({ type: 'ADD_EXPENSE', payload: newExpense });
        toast.success(`New expense added in your group: ${newExpense.title}`);
      });
      
      socket.on('new_payment', (newPayment) => {
          dispatch({ type: 'ADD_PAYMENT', payload: newPayment });
          toast.success(`${newPayment.from} paid ${newPayment.to} $${newPayment.amount.toFixed(2)}`);
      });
    }

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [state.isAuthenticated]);

  const signIn = async (email, password) => {
    const response = await api.auth.login({ email, password });
    if (response.data) {
      dispatch({ type: 'LOGIN', payload: response.data.data.user });
    }
    return response;
  };

  const signUp = async (name, email, password) => {
    return await api.auth.register({ name, email, password });
  };

  const signOut = async () => {
    try {
      await apiClient.post('/users/logout');
    } catch (error) {
      console.error("Logout failed on server, proceeding with client-side logout.", error);
    } finally {
      dispatch({ type: 'LOGOUT' });
    }
  };

  return (
    <AppContext.Provider value={{ state, dispatch, signIn, signUp, signOut }}>
      {!state.loading && children}
    </AppContext.Provider>
  );
}

export function useApp() {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
}