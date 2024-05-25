import { Link } from "react-router-dom";
import { BASE_API_URL } from "../../../../untils";
import { ChannelItem } from "./ChatSearchForm";

const ChannelSearchListItem = (props: ChannelItem) => {
  return (
    <div className="user-item">
      <div
        className="avatar"
        style={{
          backgroundImage: `url(${BASE_API_URL}/chats/c/${props.channelId}/avatar)`,
        }}
      ></div>
      <div className="user-item__middle-section">
        <span className="name">{props.channelName}</span>
        <span>Власник: {props.creator.name}</span>
        <span className="position">{props.subscribersNumber} підписників</span>
      </div>
      <div className="user-item__end-section">
        {props.subscribeChannelFn ? (
          <a onClick={() => props.subscribeChannelFn?.(props.channelId)}>
            Підписатися
          </a>
        ) : (
          <Link to={`/chats/с/${props.channelId}`}>Відкрити чат</Link>
        )}

        <Link to={`/chats/с/${props.channelId}`} className="secondary">
          Профіль
        </Link>
      </div>
    </div>
  );
};

export default ChannelSearchListItem;
