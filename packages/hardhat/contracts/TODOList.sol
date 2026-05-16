// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract TODOList {
    struct Task {
        uint256 id;
        string description;
        bool completed;
        address creator;
    }

    Task[] private tasks;
    mapping(address => uint256[]) private userTasks;

    event TaskAdded(uint256 indexed taskId, address indexed creator, string description);
    event TaskToggled(uint256 indexed taskId, bool completed);
    event TaskDeleted(uint256 indexed taskId);

    function addTask(string memory _description) external {
        require(bytes(_description).length > 0, "Empty description");
        require(bytes(_description).length <= 200, "Too long");

        uint256 taskId = tasks.length;
        tasks.push(Task(taskId, _description, false, msg.sender));
        userTasks[msg.sender].push(taskId);

        emit TaskAdded(taskId, msg.sender, _description);
    }

    function toggleCompleted(uint256 _taskId) external {
        require(_taskId < tasks.length, "Task does not exist");
        require(tasks[_taskId].creator == msg.sender, "Not your task");
        
        tasks[_taskId].completed = !tasks[_taskId].completed;
        emit TaskToggled(_taskId, tasks[_taskId].completed);
    }

    function getMyTasks() external view returns (Task[] memory) {
        uint256[] storage taskIds = userTasks[msg.sender];
        Task[] memory myTasks = new Task[](taskIds.length);
        for (uint256 i = 0; i < taskIds.length; i++) {
            myTasks[i] = tasks[taskIds[i]];
        }
        return myTasks;
    }
}