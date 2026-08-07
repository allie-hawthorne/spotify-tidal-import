import LogoutIcon from 'mdi-react/LogoutIcon';
export const LogoutButton = ({onClick}: {onClick: () => void}) => {
  return <button className='cursor-pointer' onClick={onClick}><LogoutIcon className='text-red-400' /></button>;
}