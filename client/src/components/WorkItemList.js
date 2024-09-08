import React from "react";
import WorkItem from "./WorkItem";

const WorkItemList = ({ workItems }) => {
  return (
    <div className="work-item-list">
      <h4>Work Items</h4>
      <div className="work-items-container">
        {workItems.map((item, index) => (
          <WorkItem key={index} item={item} createdAt={new Date().toLocaleString()} />
        ))}
      </div>
    </div>
  );
};

export default WorkItemList;
