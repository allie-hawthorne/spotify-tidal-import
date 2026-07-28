import { Button } from "./Button"

interface ExportButtonProps {
  isLoading: boolean
}
export const ExportButton = ({isLoading}: ExportButtonProps) => {
  return <Button disabled={isLoading} onClick={() => console.log('clicked')}>Export</Button>
}