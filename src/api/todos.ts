import { Todo } from '../types/Todo';
import { client } from '../utils/fetchClient';

export const USER_ID = 1696;

export const todosService = {
  list: () => client.get<Todo[]>(`/todos?userId=${USER_ID}`),
  delete: (todoId: number) => client.delete(`/todos/${todoId}`),
};

export enum TodosServiceError {
  UnableToLoadTodos = 'todos_service_unable_to_load_todos',
  TitleShouldNotBeEmpty = 'todos_serivce_title_should_be_empty',
  UnableToDeleteTodo = 'todos_service_unable_to_delete_todo',
}

const TODOS_ERROR_MESSAGE: Record<TodosServiceError, string> = {
  [TodosServiceError.UnableToLoadTodos]: 'Unable to load todos',
  [TodosServiceError.TitleShouldNotBeEmpty]: 'Title should not be empty',
  [TodosServiceError.UnableToDeleteTodo]: 'Unable to delete a todo',
};

export function getTodoError(errorKey: TodosServiceError): string {
  return TODOS_ERROR_MESSAGE[errorKey];
}
