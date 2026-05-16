"use client";
import { useEffect, useState } from "react";
import { useAccount, useContractRead, useContractWrite } from "wagmi";

const TODO_LIST_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

const TODO_ABI = [
  {
    inputs: [{ name: "_description", type: "string" }],
    name: "addTask",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "_taskId", type: "uint256" }],
    name: "toggleCompleted",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "getMyTasks",
    outputs: [
      {
        components: [
          { name: "id", type: "uint256" },
          { name: "description", type: "string" },
          { name: "completed", type: "bool" },
          { name: "creator", type: "address" },
        ],
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

export default function Home() {
  const { address, isConnected } = useAccount();
  const [taskInput, setTaskInput] = useState("");
  const [tasks, setTasks] = useState([]);
  const [isAdding, setIsAdding] = useState(false);

  const { data: myTasks, refetch } = useContractRead({
    address: TODO_LIST_ADDRESS,
    abi: TODO_ABI,
    functionName: "getMyTasks",
    account: address,
  });

  const { writeContractAsync: addTask } = useContractWrite();
  const { writeContractAsync: toggleTask } = useContractWrite();

  useEffect(() => {
    if (myTasks) {
      setTasks(myTasks);
    }
  }, [myTasks]);

  useEffect(() => {
    if (address) {
      refetch();
    }
  }, [address, refetch]);

  const handleAddTask = async () => {
    if (!taskInput.trim()) return;
    setIsAdding(true);
    try {
      await addTask({
        address: TODO_LIST_ADDRESS,
        abi: TODO_ABI,
        functionName: "addTask",
        args: [taskInput],
      });
      setTaskInput("");
      await refetch();
    } catch (error) {
      console.error(error);
    }
    setIsAdding(false);
  };

  const handleToggle = async (taskId: number) => {
    try {
      await toggleTask({
        address: TODO_LIST_ADDRESS,
        abi: TODO_ABI,
        functionName: "toggleCompleted",
        args: [BigInt(taskId)],
      });
      await refetch();
    } catch (error) {
      console.error(error);
    }
  };

  if (!isConnected) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold">TODO List на блокчейне</h1>
        <p className="mt-4">Подключите кошелёк MetaMask</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Мой TODO-лист</h1>

      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={taskInput}
          onChange={e => setTaskInput(e.target.value)}
          placeholder="Новая задача..."
          className="border p-2 flex-grow rounded text-black"
        />
        <button
          onClick={handleAddTask}
          disabled={isAdding}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:bg-gray-400"
        >
          {isAdding ? "Добавление..." : "+ Добавить"}
        </button>
      </div>

      {tasks.length === 0 ? (
        <p className="text-gray-500">Нет задач. Добавьте первую!</p>
      ) : (
        <ul className="space-y-3">
          {tasks.map((task: any) => (
            <li key={task.id.toString()} className="border p-3 rounded flex items-center gap-3">
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => handleToggle(Number(task.id))}
                className="w-5 h-5"
              />
              <span className={task.completed ? "line-through text-gray-400" : ""}>{task.description}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
