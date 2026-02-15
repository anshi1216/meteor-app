// imports/ui/App.js
import { Template } from 'meteor/templating';
import { TasksCollection } from "../api/TasksCollection.js";
import { ReactiveDict } from 'meteor/reactive-dict';
import ProjectManager from './ProjectManager.jsx';
import './App.html';
import './Task.js';
import './Login.js';

const HIDE_COMPLETED_STRING = "hideCompleted";
const getUser = () => Meteor.user();
const isUserLogged = () => !!getUser();

// Helper to compute filters
const getTasksFilter = (instance) => {
  const user = getUser();
  const hideCompleted = instance.state.get(HIDE_COMPLETED_STRING);
  const hideCompletedFilter = { isChecked: { $ne: true } };
  const userFilter = user ? { userId: user._id } : {};
  const pendingOnlyFilter = { ...hideCompletedFilter, ...userFilter };
  return { userFilter, pendingOnlyFilter, hideCompleted };
};

Template.mainContainer.onCreated(function () {
  this.state = new ReactiveDict();
  this.state.set(HIDE_COMPLETED_STRING, false);
  

  // Subscribe to tasks reactively when user logs in
  this.autorun(() => {
    if (Meteor.userId()) {
      this.tasksSub = this.subscribe('tasks');
    }
  });
});


Template.mainContainer.helpers({
  isUserLogged() {
    return isUserLogged();
  },
  ProjectManager() {
    return ProjectManager;
  },
  tasksLoading() {
    const instance = Template.instance();
    return !(instance.tasksSub && instance.tasksSub.ready());
  },

  tasks() {
    const instance = Template.instance();
    if (!isUserLogged()) return [];
    const { pendingOnlyFilter, userFilter, hideCompleted } = getTasksFilter(instance);
    return TasksCollection.find(hideCompleted ? pendingOnlyFilter : userFilter, {
      sort: { createdAt: -1 },
    }).fetch();
  },

  incompleteCount() {
    const instance = Template.instance();
    if (!isUserLogged()) return '';
    const { pendingOnlyFilter } = getTasksFilter(instance);
    const count = TasksCollection.find(pendingOnlyFilter).count();
    return count ? `(${count})` : '';
  },

  getUser() {
    return getUser();
  },

  hideCompleted() {
    return Template.instance().state.get(HIDE_COMPLETED_STRING);
  },  
});


Template.form.events({
 "submit .task-form"(event) {
    event.preventDefault();

    const text = event.target.text.value.trim();
    if (!text) return;

    Meteor.call('tasks.insert', text, (err) => {
      if (err) alert(err.reason);
    });
    event.target.text.value = '';
  }
});

Template.mainContainer.events({
  "click #hide-completed-button"(event, instance) {
    const current = instance.state.get(HIDE_COMPLETED_STRING);
    instance.state.set(HIDE_COMPLETED_STRING, !current);
  },

  'click .user'() {
    Meteor.logout();
  },
});
