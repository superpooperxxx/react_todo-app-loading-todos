/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { UserWarning } from './UserWarning';
import {
  getTodoError,
  todosService,
  TodosServiceError,
  USER_ID,
} from './api/todos';
import type { Todo } from './types/Todo';
import { TodoItem } from './components/TodoItem';
import { ErrorNotification } from './components/ErrorNotification';
import { useErrorMessage } from './hooks/useErrorMessage';
import { StatusFilter, TodoStatus } from './components/StatusFilter';
import { getSortedTodos } from './utils/getSortedTodos';

import cn from 'classnames';
import { AddTodoForm, AddTodoFormData } from './components/AddTodoForm';
import { TodoCreate } from './types/TodoCreate';
import { TodoUpdate } from './types/TodoUpdate';
import { useLoadingIds } from './hooks/useLoadingTodoIds';

function getFilteredTodos(todos: Todo[], { status }: { status: TodoStatus }) {
  let filteredTodos = todos;

  if (status !== TodoStatus.All) {
    filteredTodos = filteredTodos.filter(todo => {
      switch (status) {
        case TodoStatus.Completed:
          return todo.completed;

        case TodoStatus.Active:
          return !todo.completed;

        default:
          throw new Error('Missing case in getFilteredTodos status filter');
      }
    });
  }

  return filteredTodos;
}

export const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [tempTodo, setTempTodo] = useState<Todo | null>(null);
  const [statusFilter, setStatusFilter] = useState(TodoStatus.All);
  const newTodoTitleRef = useRef<HTMLInputElement>(null);

  const { errorMessage, setErrorMessage, resetErrorMessage } =
    useErrorMessage();

  const {
    isIdLoading: isTodoLoading,
    addToLoading: handleAddToLoading,
    removeFromLoading: handleRemoveFromLoading,
  } = useLoadingIds<number>();

  const { completed: completedTodos, active: activeTodos } =
    getSortedTodos(todos);

  const handleDeleteTodo = useCallback(
    (todoId: number) => {
      handleAddToLoading(todoId);

      todosService
        .delete(todoId)
        .then(() => {
          setTodos(current => current.filter(todo => todo.id !== todoId));
        })
        .catch(() => {
          setErrorMessage(getTodoError(TodosServiceError.UnableToDeleteTodo));
        })
        .finally(() => {
          handleRemoveFromLoading(todoId);

          newTodoTitleRef.current?.focus();
        });
    },
    [
      newTodoTitleRef,
      handleAddToLoading,
      handleRemoveFromLoading,
      setErrorMessage,
    ],
  );

  const handleClearCompleted = useCallback(() => {
    completedTodos.forEach(todo => {
      handleDeleteTodo(todo.id);
    });
  }, [completedTodos, handleDeleteTodo]);

  const handleCreateTodo = useCallback(
    (
      values: AddTodoFormData,
      {
        onSuccess,
        onError,
      }: { onSuccess?: (createdTodo: Todo) => void; onError?: () => void } = {},
    ) => {
      if (newTodoTitleRef.current) {
        newTodoTitleRef.current.disabled = true;
      }

      const createTodoDto: TodoCreate = {
        title: values.title,
        userId: USER_ID,
        completed: false,
      };

      setTempTodo({
        id: 0,
        ...createTodoDto,
      });

      todosService
        .create(createTodoDto)
        .then(createdTodo => {
          setTodos(current => [...current, createdTodo]);

          onSuccess?.(createdTodo);
        })
        .catch(() => {
          setErrorMessage(getTodoError(TodosServiceError.UnableToAddTodo));

          onError?.();
        })
        .finally(() => {
          setTempTodo(null);

          if (newTodoTitleRef.current) {
            newTodoTitleRef.current.disabled = false;
          }

          newTodoTitleRef.current?.focus();
        });
    },
    [newTodoTitleRef, setErrorMessage],
  );

  const handleUpdateTodo = useCallback(
    (
      todoId: number,
      data: TodoUpdate,
      {
        onSuccess,
        onError,
      }: { onSuccess?: (updatedTodo: Todo) => void; onError?: () => void } = {},
    ) => {
      handleAddToLoading(todoId);

      todosService
        .update(todoId, data)
        .then(updatedTodo => {
          setTodos(current =>
            current.map(todo => {
              return todo.id === updatedTodo.id ? updatedTodo : todo;
            }),
          );

          onSuccess?.(updatedTodo);
        })
        .catch(() => {
          setErrorMessage(getTodoError(TodosServiceError.UnableToUpdateTodo));

          onError?.();
        })
        .finally(() => {
          handleRemoveFromLoading(todoId);
        });
    },
    [handleAddToLoading, handleRemoveFromLoading, setErrorMessage],
  );

  const handleBulkToggleStatus = useCallback(() => {
    if (activeTodos.length !== 0) {
      activeTodos.forEach(({ id, ...todo }) => {
        handleUpdateTodo(id, {
          title: todo.title,
          userId: todo.userId,
          completed: !todo.completed,
        });
      });

      return;
    }

    todos.forEach(({ id, ...todo }) => {
      handleUpdateTodo(id, {
        title: todo.title,
        userId: todo.userId,
        completed: !todo.completed,
      });
    });
  }, [todos, activeTodos, handleUpdateTodo]);

  useEffect(() => {
    todosService

      .list()
      .then(todosFromServer => setTodos(todosFromServer))
      .catch(() => {
        setErrorMessage(getTodoError(TodosServiceError.UnableToLoadTodos));
      })
      .finally();
  }, [setErrorMessage]);

  const filteredTodos = getFilteredTodos(todos, { status: statusFilter });

  const showTodosAndFooter = todos.length > 0;
  const showToggleAllButton = todos.length > 0;
  const showClearCompletedButton = completedTodos.length > 0;
  const activeTodosAmount = activeTodos.length;
  const shouldToggleButtonBeActive = completedTodos.length === todos.length;

  if (!USER_ID) {
    return <UserWarning />;
  }

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        <header className="todoapp__header">
          {showToggleAllButton && (
            <button
              type="button"
              className={cn('todoapp__toggle-all', {
                active: shouldToggleButtonBeActive,
              })}
              data-cy="ToggleAllButton"
              onClick={handleBulkToggleStatus}
            />
          )}

          <AddTodoForm
            ref={newTodoTitleRef}
            onError={setErrorMessage}
            onSubmit={handleCreateTodo}
          />
        </header>

        {showTodosAndFooter && (
          <>
            <section className="todoapp__main" data-cy="TodoList">
              {filteredTodos.map(todo => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  loading={isTodoLoading(todo.id)}
                  onDelete={handleDeleteTodo}
                  onUpdate={handleUpdateTodo}
                />
              ))}

              {tempTodo && <TodoItem todo={tempTodo} loading />}
            </section>

            <footer className="todoapp__footer" data-cy="Footer">
              <span className="todo-count" data-cy="TodosCounter">
                {activeTodosAmount} items left
              </span>

              <StatusFilter
                value={statusFilter}
                onValueChange={setStatusFilter}
              />

              <button
                type="button"
                className="todoapp__clear-completed"
                data-cy="ClearCompletedButton"
                disabled={!showClearCompletedButton}
                onClick={handleClearCompleted}
              >
                Clear completed
              </button>
            </footer>
          </>
        )}
      </div>

      {/* DON'T use conditional rendering to hide the notification */}
      {/* Add the 'hidden' class to hide the message smoothly */}
      <ErrorNotification
        notification={errorMessage}
        onClear={resetErrorMessage}
      />
    </div>
  );
};
