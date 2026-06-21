const TaskManager = artifacts.require("TaskManager");

contract("TaskManager", (accounts) => {
  let taskManager;
  const owner = accounts[0];
  const nonOwner = accounts[1];

  beforeEach(async () => {
    taskManager = await TaskManager.new();
  });

  describe("Initialization", () => {
    it("should set the deployer as owner", async () => {
      const contractOwner = await taskManager.owner();
      assert.equal(contractOwner, owner, "Owner should be the deployer");
    });

    it("should initialize taskCounter to 0", async () => {
      const counter = await taskManager.taskCounter();
      assert.equal(parseInt(counter), 0, "Task counter should start at 0");
    });
  });

  describe("State Variables", () => {
    it("should have owner as a state variable", async () => {
      const contractOwner = await taskManager.owner();
      assert.equal(contractOwner, owner, "Owner state variable is set correctly");
    });

    it("should have taskCounter as a state variable", async () => {
      const counter = await taskManager.taskCounter();
      assert.equal(counter.toNumber() >= 0, true, "taskCounter exists as state variable");
    });
  });

  describe("Task Creation (Store Data)", () => {
    it("should allow owner to create a task", async () => {
      const description = "Complete Assignment";
      const tx = await taskManager.createTask(description, { from: owner });

      // Check event
      const event = tx.logs[0];
      assert.equal(event.event, "TaskCreated", "TaskCreated event should be emitted");

      // Verify task counter increased
      const counter = await taskManager.taskCounter();
      assert.equal(parseInt(counter), 1, "Task counter should increment");
    });

    it("should reject task creation from non-owner", async () => {
      try {
        await taskManager.createTask("Unauthorized task", { from: nonOwner });
        assert.fail("Should have thrown an error");
      } catch (error) {
        assert.include(error.message, "Only contract owner", "Should reject non-owner");
      }
    });

    it("should reject empty task description", async () => {
      try {
        await taskManager.createTask("", { from: owner });
        assert.fail("Should have thrown an error");
      } catch (error) {
        assert.include(error.message, "cannot be empty", "Should reject empty description");
      }
    });

    it("should reject task description that is too long", async () => {
      const longDescription = "a".repeat(257);
      try {
        await taskManager.createTask(longDescription, { from: owner });
        assert.fail("Should have thrown an error");
      } catch (error) {
        assert.include(error.message, "too long", "Should reject long description");
      }
    });
  });

  describe("Task Retrieval (Retrieve Data)", () => {
    beforeEach(async () => {
      // Create some tasks before testing retrieval
      await taskManager.createTask("Task 1", { from: owner });
      await taskManager.createTask("Task 2", { from: owner });
    });

    it("should retrieve task details correctly", async () => {
      const task = await taskManager.getTask(1);

      assert.equal(parseInt(task.id), 1, "Task ID should match");
      assert.equal(task.description, "Task 1", "Task description should match");
      assert.equal(task.isCompleted, false, "Task should not be completed initially");
    });

    it("should reject retrieval of non-existent task", async () => {
      try {
        await taskManager.getTask(999);
        assert.fail("Should have thrown an error");
      } catch (error) {
        assert.include(error.message, "does not exist", "Should reject non-existent task");
      }
    });

    it("should allow anyone to retrieve task details", async () => {
      // This tests that retrieve is a public view function
      const task = await taskManager.getTask(1, { from: nonOwner });
      assert.equal(task.description, "Task 1", "Non-owner should be able to retrieve");
    });
  });

  describe("Task Update (Modify Stored Data)", () => {
    beforeEach(async () => {
      await taskManager.createTask("Original Task", { from: owner });
    });

    it("should update task description", async () => {
      const newDescription = "Updated Task";
      await taskManager.updateTask(1, newDescription, { from: owner });

      const task = await taskManager.getTask(1);
      assert.equal(task.description, newDescription, "Task description should be updated");
    });

    it("should reject update from non-owner", async () => {
      try {
        await taskManager.updateTask(1, "Hacked", { from: nonOwner });
        assert.fail("Should have thrown an error");
      } catch (error) {
        assert.include(error.message, "Only contract owner", "Should reject non-owner update");
      }
    });

    it("should reject update with empty description", async () => {
      try {
        await taskManager.updateTask(1, "", { from: owner });
        assert.fail("Should have thrown an error");
      } catch (error) {
        assert.include(error.message, "cannot be empty", "Should reject empty description");
      }
    });

    it("should reject update of completed task", async () => {
      await taskManager.completeTask(1, { from: owner });

      try {
        await taskManager.updateTask(1, "Updated", { from: owner });
        assert.fail("Should have thrown an error");
      } catch (error) {
        assert.include(error.message, "Cannot update a completed task", "Should reject update of completed task");
      }
    });
  });

  describe("Access Control & Validation", () => {
    beforeEach(async () => {
      await taskManager.createTask("Test Task", { from: owner });
    });

    it("should prevent non-owner from completing tasks", async () => {
      try {
        await taskManager.completeTask(1, { from: nonOwner });
        assert.fail("Should have thrown an error");
      } catch (error) {
        assert.include(error.message, "Only contract owner", "Should reject non-owner");
      }
    });

    it("should allow owner to complete tasks", async () => {
      const tx = await taskManager.completeTask(1, { from: owner });

      const event = tx.logs[0];
      assert.equal(event.event, "TaskCompleted", "TaskCompleted event should be emitted");

      const task = await taskManager.getTask(1);
      assert.equal(task.isCompleted, true, "Task should be marked as completed");
    });

    it("should prevent completing an already completed task", async () => {
      await taskManager.completeTask(1, { from: owner });

      try {
        await taskManager.completeTask(1, { from: owner });
        assert.fail("Should have thrown an error");
      } catch (error) {
        assert.include(error.message, "already completed", "Should reject re-completing");
      }
    });
  });

  describe("Additional Features", () => {
    it("should return total task count", async () => {
      await taskManager.createTask("Task 1", { from: owner });
      await taskManager.createTask("Task 2", { from: owner });
      await taskManager.createTask("Task 3", { from: owner });

      const total = await taskManager.getTotalTasks();
      assert.equal(parseInt(total), 3, "Should return correct total");
    });

    it("should track owner task count", async () => {
      await taskManager.createTask("Task 1", { from: owner });
      await taskManager.createTask("Task 2", { from: owner });

      const count = await taskManager.getOwnerTaskCount();
      assert.equal(parseInt(count), 2, "Should return correct owner task count");
    });

    it("should allow ownership transfer", async () => {
      await taskManager.transferOwnership(nonOwner, { from: owner });

      const newOwner = await taskManager.owner();
      assert.equal(newOwner, nonOwner, "Ownership should be transferred");
    });

    it("should reject invalid ownership transfer", async () => {
      try {
        await taskManager.transferOwnership(
          "0x0000000000000000000000000000000000000000",
          { from: owner }
        );
        assert.fail("Should have thrown an error");
      } catch (error) {
        assert.include(error.message, "Invalid owner address", "Should reject zero address");
      }
    });
  });
});
