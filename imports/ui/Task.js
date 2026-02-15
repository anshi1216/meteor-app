import { Template } from "meteor/templating";
import { Meteor } from "meteor/meteor";
import { ProjectsCollection } from "../api/ProjectsCollection";
import "./Task.html";

Template.task.onCreated(function () {
  this.subscribe("projects");
});

Template.task.helpers({
  projects() {
    return ProjectsCollection.find();
  },

  isSelected(projectId, taskProjectId) {
    return projectId === taskProjectId;
  }
});


Template.task.events({
  "click .toggle-checked"() {
    Meteor.call("tasks.toggleChecked", this._id, this.isChecked);
  },

  "click .delete"() {
    Meteor.call("tasks.remove", this._id);
  },

  "change .assign-project"(event) {
    const projectId = event.target.value || null;

    Meteor.call("tasks.assignToProject", this._id, projectId);
  }
});
