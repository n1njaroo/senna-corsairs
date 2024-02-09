const { ModalSubmitInteraction, EmbedBuilder } = require('discord.js');
const ExtendedClient = require('../../class/ExtendedClient');

module.exports = {
    customId: 'announcement',
    /**
     * 
     * @param {ExtendedClient} client 
     * @param {ModalSubmitInteraction} interaction 
     */
    run: async (client, interaction) => {
        // Get the title input from the interaction
        const titleInput = interaction.fields.getTextInputValue('title-input');
        const contentInput = interaction.fields.getTextInputValue('content-input');

        // Create the embed using EmbedBuilder
        const embed = new EmbedBuilder()
            .setTitle(titleInput)
            .setDescription(contentInput)
            .setColor('#0099ff')
            .setTimestamp();

        // Reply with the embed
        await interaction.reply({ embeds: [embed] });
    }
};
