'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
     return queryInterface.addColumn('expenses', 'note', {
      type: Sequelize.STRING,
      allowNull: true, 
    });
  },

  async down (queryInterface, _Sequelize) {
     return queryInterface.removeColumn('expenses', 'note');
  }
};
