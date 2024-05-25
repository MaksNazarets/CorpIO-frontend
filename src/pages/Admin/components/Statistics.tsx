import { animated, useSpring } from "@react-spring/web";
import { useQuery } from "react-query";
import { axiosInstance } from "../../../untils";

export const Statistics = () => {
  const springs = useSpring({
    from: { transform: "translateY(10px)", opacity: 0 },
    to: { transform: "translateY(0)", opacity: 1 },
  });

  const { refetch: getMessagingLoad } = useQuery({
    queryKey: ["msg-load-stats"],
    queryFn: () =>
      axiosInstance.get("/stats/messaging-load", {
        responseType: "blob",
      }),
    onSuccess: (res) => {
      const url = window.URL.createObjectURL(new Blob([res.data]));

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "stats.xlsx");
      document.body.appendChild(link);
      link.click();

      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    },
    onError: (err) => {
      console.log("Error while receiving stats:", err);
      alert("При ориманні даних сталась невідома помилка");
    },

    enabled: false,
  });

  return (
    <animated.div
      className={`admin-page-wrapper`}
      style={{ maxWidth: "700px", width: "100%", ...springs }}
    >
      <h1 className="admin-header">Статистика</h1>
      <div className="form-container">
        <button
          className="admin-btn save-changes-btn"
          onClick={() => getMessagingLoad()}
        >
          Погодинне навантаження на сервіс повідомлень
        </button>
      </div>
    </animated.div>
  );
};
