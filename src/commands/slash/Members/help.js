const { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const ExtendedClient = require('../../../class/ExtendedClient');
const config = require('../../../config');
const GuildSchema = require('../../../schemas/GuildSchema');

module.exports = {
    structure: new SlashCommandBuilder()
        .setName('help')
        .setDescription('View all the possible commands!'),
    options: {
        cooldown: 15000
    },
    /**
     * @param {ExtendedClient} client 
     * @param {ChatInputCommandInteraction} interaction 
     */
    run: async (client, interaction) => {

        await interaction.deferReply();

        let prefix = config.handler.prefix;

        if (config.handler?.mongodb?.enabled) {
            try {
                const data = await GuildSchema.findOne({ guild: message.guildId });

                if (data && data?.prefix) prefix = data.prefix;
            } catch {
                prefix = config.handler.prefix;
            }
        }

        // Filter out commands if developers option is true
        const mapIntCmds = client.applicationcommandsArray
            .filter((v) => {
                if (v.options && v.options.permissions === 'Administrator') {
                    console.log(`Command ${v.name} has developers option set to true.`);
                    return false; // exclude commands with developers option set to true
                }
                return true;
            })
            .map((v) => `\`${(v.type === 2 || v.type === 3) ? '' : '/'}${v.name}\`: ${v.description || '(No description)'}`);

        await interaction.followUp({
            embeds: [
                new EmbedBuilder()
                    .setTitle('Here are the following commands that I can provide!')
                    .addFields(
                        { name: 'Slash Commands', value: `${mapIntCmds.join('\n')}` }
                    )
            ]
        });

    }
};
