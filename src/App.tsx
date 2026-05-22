/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useCallback, useEffect, useState } from 'react';
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
  const [loadingTodoIds, setLoadingTodoIds] = useState<number[]>([]);
  const [statusFilter, setStatusFilter] = useState(TodoStatus.All);

  const { errorMessage, setErrorMessage, resetErrorMessage } =
    useErrorMessage();

  const isTodoLoading = useCallback(
    (todoId: number) => loadingTodoIds.includes(todoId),
    [loadingTodoIds],
  );

  const handleToggleTodoLoading = useCallback(
    (todoId: number) => {
      if (isTodoLoading(todoId)) {
        setLoadingTodoIds(current => current.filter(id => id !== todoId));
      } else {
        setLoadingTodoIds(current => [...current, todoId]);
      }
    },
    [isTodoLoading],
  );

  const handleDeleteTodo = useCallback(
    (todoId: number) => {
      handleToggleTodoLoading(todoId);

      todosService
        .delete(todoId)
        .then(() => {
          setTodos(current => current.filter(todo => todo.id !== todoId));
        })
        .catch(() => {
          setErrorMessage(getTodoError(TodosServiceError.UnableToDeleteTodo));
        })
        .finally(() => {
          handleToggleTodoLoading(todoId);
        });
    },
    [handleToggleTodoLoading, setErrorMessage],
  );

  useEffect(() => {
    todosService

      .list()
      .then(todosFromServer => setTodos(todosFromServer))
      .catch(() => {
        setErrorMessage(getTodoError(TodosServiceError.UnableToLoadTodos));
      })
      .finally();
  }, [setErrorMessage]);

  const showTodosAndFooter = todos.length > 0;
  const showToggleAllButton = todos.length > 0;

  const filteredTodos = getFilteredTodos(todos, { status: statusFilter });
  const { completed: completedTodos, active: activeTodos } =
    getSortedTodos(todos);

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
            />
          )}

          {/* Add a todo on form submit */}
          <form>
            <input
              data-cy="NewTodoField"
              type="text"
              className="todoapp__new-todo"
              placeholder="What needs to be done?"
            />
          </form>
        </header>

        {showTodosAndFooter && (
          <>
            <section className="todoapp__main" data-cy="TodoList">
              {filteredTodos.map(todo => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onDelete={handleDeleteTodo}
                  loading={isTodoLoading(todo.id)}
                />
              ))}
            </section>

            <footer className="todoapp__footer" data-cy="Footer">
              <span className="todo-count" data-cy="TodosCounter">
                {activeTodosAmount} items left
              </span>

              <StatusFilter
                value={statusFilter}
                onValueChange={setStatusFilter}
              />

              {/* this button should be disabled if there are no completed todos */}
              <button
                type="button"
                className="todoapp__clear-completed"
                data-cy="ClearCompletedButton"
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
