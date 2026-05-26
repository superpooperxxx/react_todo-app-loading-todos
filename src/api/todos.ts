import { Todo } from '../types/Todo';
import { TodoCreate } from '../types/TodoCreate';
import { TodoUpdate } from '../types/TodoUpdate';
import { client } from '../utils/fetchClient';

export const USER_ID = 1696;

export const todosService = {
  list: () => client.get<Todo[]>(`/todos?userId=${USER_ID}`),
  create: (data: TodoCreate) => client.post<Todo>('/todos', data),
  delete: (todoId: number) => client.delete(`/todos/${todoId}`),
  update: (todoId: number, data: TodoUpdate) =>
    client.patch<Todo>(`/todos/${todoId}`, data),
};

export enum TodosServiceError {
  UnableToLoadTodos = 'todos_service_unable_to_load_todos',
  TitleShouldNotBeEmpty = 'todos_serivce_title_should_be_empty',
  UnableToDeleteTodo = 'todos_service_unable_to_delete_todo',
  UnableToAddTodo = 'todos_service_unable_to_add_todo',
  UnableToUpdateTodo = 'todos_service_unable_to_update_todo',
}

const TODOS_ERROR_MESSAGE: Record<TodosServiceError, string> = {
  [TodosServiceError.UnableToLoadTodos]: 'Unable to load todos',
  [TodosServiceError.TitleShouldNotBeEmpty]: 'Title should not be empty',
  [TodosServiceError.UnableToDeleteTodo]: 'Unable to delete a todo',
  [TodosServiceError.UnableToAddTodo]: 'Unable to add a todo',
  [TodosServiceError.UnableToUpdateTodo]: 'Unable to add a todo',
};

export function getTodoError(errorKey: TodosServiceError): string {
  return TODOS_ERROR_MESSAGE[errorKey];
}
