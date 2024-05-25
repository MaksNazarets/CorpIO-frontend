import { animated, easings, useSpring } from "@react-spring/web";
import { BASE_API_URL } from "../../untils";
import { DownloadIcon } from "../../assets/icon_components/DownloadIcon";
import { CloseIcon } from "../../assets/icon_components/CloseIcon";

type Props = {
  fileId: number;
  closeFn: () => void;
};

function MediaViewer({ fileId, closeFn }: Props) {
  const springs = useSpring({
    from: {
      opacity: 0,
      backdropFilter: "blur(0px)",
    },
    to: {
      opacity: 1,
      backdropFilter: "blur(5px)",
    },
    config: { duration: 200, easing: easings.easeOutSine },
  });

  return (
    <animated.div className="media-viewer" style={springs}>
      <div className="backdrop" onClick={() => closeFn()}></div>
      <img
        src={`${BASE_API_URL}/chats/get-file?attId=${fileId}`}
        onClick={() => closeFn()}
      />
      <div className="media-viewer__btn close-btn" onClick={() => closeFn()}>
        <CloseIcon />
      </div>
      <a
        className="media-viewer__btn download-btn"
        href={`${BASE_API_URL}/chats/get-file?attId=${fileId}`}
        download
      >
        <DownloadIcon />
      </a>
    </animated.div>
  );
}

export default MediaViewer;
