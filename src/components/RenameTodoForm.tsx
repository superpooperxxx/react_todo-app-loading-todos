import { FormEventHandler, useState } from 'react';

type RenameTodoFormProps = {
  defaultValue: string;
  onSubmit: (value: string) => void;
  onClose: () => void;
  onDelete: () => void;
};

export function RenameTodoForm({
  defaultValue,
  onSubmit,
  onClose,
  onDelete,
}: RenameTodoFormProps) {
  const [newTitle, setNewTitle] = useState(defaultValue);

  const handleProcessNewTitle = () => {
    const preparedNewTitle = newTitle.trim();

    // Close the form, if the title is unchanged
    if (preparedNewTitle === defaultValue) {
      onClose();

      return;
    }

    // If the new title is empty, then we delete this todo
    if (preparedNewTitle === '') {
      onDelete();

      return;
    }

    onSubmit(preparedNewTitle);
  };

  const handleSubmit: FormEventHandler<HTMLFormElement> = event => {
    event.preventDefault();

    handleProcessNewTitle();
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        data-cy="TodoTitleField"
        type="text"
        className="todo__title-field"
        placeholder="Empty todo will be deleted"
        value={newTitle}
        onChange={event => setNewTitle(event.target.value)}
        autoFocus
        onBlur={handleProcessNewTitle}
      />
    </form>
  );
}
