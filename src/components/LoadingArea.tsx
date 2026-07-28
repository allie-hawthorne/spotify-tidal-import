import { PieChart } from "react-minimal-pie-chart";
import { useSpotify } from "../api-helpers/SpotifyContext";

export const LoadingArea = ({setShowMore}: {setShowMore: (v: boolean) => void}) => {
  const {overallProgress, overallTotal, haveTotalsReturned} = useSpotify();

  return <div className="flex flex-col items-center h-32">
    <p>Loading your Spotify data...</p>
    <a className="text-gray-400" href="#" onClick={() => setShowMore(true)}>Show More Info</a>
    {/* <p className="text-gray-300">this may take a while</p> */}
    {haveTotalsReturned && <PieChart className="h-full mt-3"
      startAngle={-90}
      lineWidth={25}
      animate
      data={[
        {color: '#99a1af', value: overallProgress},
        {color: '#e5e7eb', value: overallTotal-overallProgress},
      ]}
    />}
  </div>;
}