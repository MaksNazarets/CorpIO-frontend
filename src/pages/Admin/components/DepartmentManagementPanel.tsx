import { animated, useSpring } from "@react-spring/web";
import { useState } from "react";
import { useQuery } from "react-query";
import { PopUpMessage } from "../../../shared/components/PopUpMessage";
import { MessageType } from "../../../types";
import { axiosInstance } from "../../../untils";
import { DepartmentItem } from "./DepartmentItem";

export const DepartmentManagementPanel = () => {
  const springs = useSpring({
    from: { transform: "translateY(10px)", opacity: 0 },
    to: { transform: "translateY(0)", opacity: 1 },
  });

  const showMessage = (msg: MessageType) => {
    setServiceMessage(msg);
    setTimeout(() => {
      setServiceMessage(null);
    }, 2500);
  };

  const { data: departmentList } = useQuery({
    queryKey: ["departmentList"],
    queryFn: () => axiosInstance.get("departments/get-department-list"),
    onSuccess(res) {
      console.log("departments list received:", res.data?.departments);
    },
    onError(err) {
      console.error("an error accured during fetching departments:", err);
      showMessage({
        text: "При отриманні списку відділів сталась невідома помилка :(",
        type: "error",
      });
    },
  });

  const [serviceMessage, setServiceMessage] = useState<any>(null);

  return (
    <animated.div className="admin-page-wrapper" style={{ ...springs }}>
      <h1 className="admin-header">Відділи</h1>
      <div className="department-list">
        {departmentList?.data?.departments.map((dep: any) => (
          <DepartmentItem
            id={dep.id}
            name={dep.name}
            head={dep.head || "не призначено"}
            key={dep.id}
          />
        ))}
      </div>
      {serviceMessage && (
        <PopUpMessage text={serviceMessage.text} type={serviceMessage.type} />
      )}
    </animated.div>
  );
};
