import { expect } from "chai";
import { ethers } from "hardhat";

describe("TODOList", function () {
  let todoList: any;
  let owner: any;
  let addr1: any;

  beforeEach(async () => {
    const TODOList = await ethers.getContractFactory("TODOList");
    todoList = await TODOList.deploy({ gasLimit: 10000000 });
    [owner, addr1] = await ethers.getSigners();
  });

  it("should add a task and emit TaskAdded event", async () => {
    await expect(todoList.addTask("Write tests", { gasLimit: 10000000 }))
      .to.emit(todoList, "TaskAdded")
      .withArgs(0, owner.address, "Write tests");
    
    const tasks = await todoList.getMyTasks();
    expect(tasks[0].description).to.equal("Write tests");
    expect(tasks[0].completed).to.equal(false);
  });

  it("should toggle task completion and emit TaskToggled", async () => {
    await todoList.addTask("Toggle me", { gasLimit: 10000000 });
    await expect(todoList.toggleCompleted(0, { gasLimit: 10000000 }))
      .to.emit(todoList, "TaskToggled")
      .withArgs(0, true);
    
    const tasks = await todoList.getMyTasks();
    expect(tasks[0].completed).to.equal(true);
  });

  it("should revert if non-creator tries to toggle", async () => {
    await todoList.addTask("My task", { gasLimit: 10000000 });
    await expect(todoList.connect(addr1).toggleCompleted(0, { gasLimit: 10000000 }))
      .to.be.revertedWith("Not your task");
  });
});