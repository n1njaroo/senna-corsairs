const { ChatInputCommandInteraction, SlashCommandBuilder, ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const ExtendedClient = require('../../../class/ExtendedClient');

module.exports = {
    structure: new SlashCommandBuilder()
        .setName('announce')
        .setDescription('Modal interaction testing.'),
    options: {
            developers: true,
        },
    /**
     * @param {ExtendedClient} client 
     * @param {ChatInputCommandInteraction} interaction 
     */
    run: async (client, interaction) => {

        const modal = new ModalBuilder()
            .setTitle('Announcement')
            .setCustomId('announcement')
            .addComponents(
                new ActionRowBuilder()
                    .addComponents(
                        new TextInputBuilder()
                            .setLabel('Title')
                            .setCustomId('title-input')
                            .setPlaceholder('Type your title here!')
                            .setStyle(TextInputStyle.Short)
                            .setRequired(true)
                    )
            )
            .addComponents(
                new ActionRowBuilder()
                    .addComponents(
                        new TextInputBuilder()
                            .setLabel('Content')
                            .setCustomId('content-input')
                            .setPlaceholder('Type your content here!')
                            .setStyle(TextInputStyle.Paragraph)
                            .setRequired(true)
                    )
            );

        await interaction.showModal(modal);

    }
};