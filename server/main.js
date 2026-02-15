import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import 'meteor/accounts-password';
import { TasksCollection } from '/imports/api/TasksCollection';
import { ProjectsCollection } from '../imports/api/ProjectsCollection';


const SEED_USERNAME = 'meteorite';
const SEED_PASSWORD = 'password';

Meteor.startup(async () => {
  // 1. Create default user if not exists
  let user = await Accounts.findUserByUsername(SEED_USERNAME);
  if (!user) {
    await Accounts.createUser({
      username: SEED_USERNAME,
      password: SEED_PASSWORD,
    });
    user = await Accounts.findUserByUsername(SEED_USERNAME);
  }

  // 2. Seed tasks only if none exist for this user
  const tasksCount = await TasksCollection.find({ userId: user._id }).countAsync();
  if (tasksCount === 0) {
    const tasks = [
      'First Task',
      'Second Task',
      'Third Task',
      'Fourth Task',
      'Fifth Task',
      'Sixth Task',
      'Seventh Task',
    ];

    for (const text of tasks) {
      await TasksCollection.insertAsync({
        text,
        userId: user._id,
        createdAt: new Date(),
        projectId: null,
      });
    }
  }
});

// 3. Publish tasks for logged-in users
Meteor.publish('tasks', function publishTasks() {
  if (!this.userId) return this.ready();
  return TasksCollection.find({ userId: this.userId }, { sort: { createdAt: -1 } });
});

Meteor.publish('projects', function () {
  if (!this.userId) return this.ready();
  return ProjectsCollection.find({ userId: this.userId });
});

// 4. Meteor methods for CRUD
// Meteor.methods({
//   async 'tasks.insert'(text) {
//     return await TasksCollection.insertAsync({
//       text,
//       createdAt: new Date(),
//       userId: this.userId,
//     });
//   },
//   async 'tasks.toggleChecked'(taskId, currentState) {
//     return await TasksCollection.updateAsync(taskId, {
//       $set: { isChecked: !currentState },
//     });
//   },
//   async 'tasks.remove'(taskId) {
//     return await TasksCollection.removeAsync(taskId);
//   },
// });
Meteor.methods({
  async 'tasks.insert'(text) {
    if (!this.userId) throw new Meteor.Error('not-authorized', 'You must log in.');    
    if (!text || text.trim() === '') throw new Meteor.Error('invalid-text', 'Task text cannot be empty.');

    return await TasksCollection.insertAsync({
      text,
      createdAt: new Date(),
      userId: this.userId,
    
    });
  },

  async 'tasks.toggleChecked'(taskId, currentState) {
    if (!this.userId) throw new Meteor.Error('not-authorized', 'You must log in.');
    const result = await TasksCollection.updateAsync(
      { _id: taskId, userId: this.userId }, // <--- owner filter
      { $set: { isChecked: !currentState } }
    );
    if (result === 0) throw new Meteor.Error('not-found', 'Task not found or you are not the owner.');
    return result;
  },

  async 'tasks.remove'(taskId) {
    if (!this.userId) throw new Meteor.Error('not-authorized', 'You must log in.');
    const result = await TasksCollection.removeAsync({ _id: taskId, userId: this.userId }); // <--- owner filter
    if (result === 0) throw new Meteor.Error('not-found', 'Task not found or you are not the owner.');
    return result;
  },
  async 'projects.insert'(name) {
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }

    if (!name.trim()) {
      throw new Meteor.Error('invalid-name');
    }

    return await ProjectsCollection.insertAsync({
      name,
      userId: this.userId,
      createdAt: new Date(),
    });
  },

  async 'tasks.assignToProject'(taskId, projectId) {
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }

    return await TasksCollection.updateAsync(
      { _id: taskId, userId: this.userId },
      { $set: { projectId } }
    );
  }
});



