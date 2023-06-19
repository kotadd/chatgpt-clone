import { FC } from "react";
import { ThreeDots } from "react-loader-spinner";

interface LoadingProps {
  text: string;
}

const Loading: FC<LoadingProps> = ({ text }) => {
  return (
    <div className="mt-4 flex items-center justify-start">
      <span className="mr-2 text-gray-400">{text}</span>
      <ThreeDots
        height="20"
        width="20"
        radius="5"
        color="#ffffff"
        ariaLabel="three-dots-loading"
        wrapperStyle={{}}
        visible={true}
      />
    </div>
  );
};

export default Loading;
