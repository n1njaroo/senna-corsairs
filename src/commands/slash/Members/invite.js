const {SlashCommandBuilder, EmbedBuilder} = require('discord.js');

module.exports = {
    structure: new SlashCommandBuilder()
        .setName('invite')
        .setDescription('Manage invites')
        .addSubcommand(subcommand =>
            subcommand
                .setName('invited')
                .setDescription('Display list of members invited by a user.')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('The user to check invites for.')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('leaderboard')
                .setDescription('Display leaderboard of most invites.')),

    run: async (client, interaction) => {
        try {
            // Determine which subcommand was used
            const subcommand = interaction.options.getSubcommand();

            if (subcommand === 'invited') {
                await invitedCommand(client, interaction);
            } else if (subcommand === 'leaderboard') {
                await leaderboardCommand(client, interaction);
            } else {
                // If an unknown subcommand is used
                await interaction.reply('Unknown subcommand.');
            }
        } catch (error) {
            console.error('Error in invite command:', error);
            await interaction.reply({ content: 'An error occurred while processing the command.', ephemeral: true });
        }
    }
}

async function invitedCommand(client, interaction) {
    // Get the user mentioned in the command
    const user = interaction.options.getUser('user');

    // Fetch invites
    const invites = await interaction.guild.invites.fetch();

    // Filter invites by the user mentioned
    const userInvites = invites.filter(invite => invite.inviter.id === user.id);

    // If the user has not invited anyone
    if (userInvites.size === 0) {
        await interaction.reply(`${user.tag} has not invited anyone yet.`);
        return;
    }

    // Prepare the message with invite information
    let message = `Invites by ${user.tag}:\n\n`;
    userInvites.forEach((invite, index) => {
        message += `**Invite Code:** ${invite.code}, **Uses:** ${invite.uses}\n`;
    });

    // Send the message
    const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setDescription(message);

    await interaction.reply({ embeds: [embed] });
}

async function leaderboardCommand(client, interaction) {
    var invites = await interaction.guild.invites.fetch();
    var members = await interaction.guild.members.fetch();

    async function getInvites() {
        var userInvites = [];
        await members.forEach(async member => {
            // Check if the member has the 'ADMINISTRATOR' permission
            if (!member.permissions.has('Administrator')) {
                var invitesForMember = await invites.filter(invite => invite.inviter.id === member.id);
                var count = 0;

                await invitesForMember.forEach(async invite => count += invite.uses);
                // Only add members with non-zero invites to the leaderboard
                if (count > 0) {
                    userInvites.push({ member: member.user.id, invites: count });
                }
            }
        });

        return userInvites;
    }

    async function sendMessage(message) {
        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setDescription(message);

        await interaction.reply({ embeds: [embed] }); // Remove ephemeral: true to make the message visible to everyone
    }

    var leaderboard = await getInvites();
    leaderboard.sort((a, b) => b.invites - a.invites);
    var output = leaderboard.slice(0, 10);

    var string = '```\n'; // Start code block for monospace font
    var num = 1;
    await output.forEach(async value => {
        var member = await interaction.guild.members.fetch(value.member);
        // Determine the emoji based on the rank
        let emoji = '';
        if (num === 1) {
            emoji = '🥇';
        } else if (num === 2) {
            emoji = '🥈';
        } else if (num === 3) {
            emoji = '🥉';
        } else {
            emoji = '🏅';
        }
        // Format the output string with aligned columns and emoji
        string += `${emoji} #${num.toString().padEnd(2)} Member: ${member.user.username.padEnd(20)} Total Invites: ${value.invites.toString().padEnd(5)}\n`;
        num++;
    });
    string += '```'; // End code block

    await sendMessage(`**Total Invites Leaderboard**\n\n${string}`);
}
