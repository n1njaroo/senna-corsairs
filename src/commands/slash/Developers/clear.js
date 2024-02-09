const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    structure: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Clear messages.')
        .addSubcommand((subcommand) =>
            subcommand
                .setName('messages')
                .setDescription('Clear a specific number of messages.')
                .addIntegerOption(option =>
                    option.setName('amount')
                        .setDescription('The number of messages to clear.')
                        .setRequired(true)
                )
    ),
    options: {
        developers: true,
    },
    
    run: async (client, interaction) => {
        if (interaction.isCommand()) {
            // Check if the command is "clear messages"
            if (interaction.options.getSubcommand() === 'messages') {
                const amount = interaction.options.getInteger('amount');

                // Ensure the amount is within a valid range
                if (amount <= 0 || amount > 100) {
                    await interaction.reply('Please provide a number between 1 and 100.');
                    return;
                }

                // Delete the specified number of messages
                try {
                    const messages = await interaction.channel.messages.fetch({ limit: amount });
                    await interaction.channel.bulkDelete(messages);
                    await interaction.reply(`Successfully cleared ${messages.size} messages.`);
                } catch (error) {
                    console.error('Error clearing messages:', error);
                    await interaction.reply('An error occurred while clearing messages.');
                }
            }
        }
    }
};
