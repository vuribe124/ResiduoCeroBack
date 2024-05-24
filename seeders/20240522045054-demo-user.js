'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
      return queryInterface.bulkInsert('Users', [
        {
          username: 'Juliana Abeba',
          password: await bcrypt.hash('Abeba123', 8),
          email: 'abeba@gmail.com',
          neighborhood: 'Olaya Herrera',
          phone: '3187014084',
          address: 'Cll 52D #86BB - 33',
          role_id: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
    ]);
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    return queryInterface.bulkDelete('Users', null, {});
  }
};
