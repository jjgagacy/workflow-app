import { UndoRedo } from "../components/undo-redo"

export const Operator = () => {
  return (
    <div className="bottom-0 left-0 right-0 z-10 absolute px-1">
      <div className="flex justify-between px-1 pb-2">
        <UndoRedo />
      </div>
    </div>
  )
}