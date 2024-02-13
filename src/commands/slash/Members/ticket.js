const {SlashCommandBuilder} = require('@discordjs/builders');
const {
  ChannelType,
  PermissionsBitField,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
} = require('discord.js');

// Function to generate a random string as a unique identifier
function generateUniqueIdentifier() {
  return Math.random().toString(36).substring(2, 8);
}

module.exports = {
  structure: new SlashCommandBuilder()
    .setName('ticket')
    .setDescription(
      'Create a support ticket to get better assistance regarding your issue.'
    ),

  options: {
    cooldown: 3000,
  },

  event: 'interactionCreate',

  run: async (client, interaction) => {
    if (interaction.isCommand() && interaction.commandName === 'ticket') {
      const user = interaction.user;
      const uniqueIdentifier = generateUniqueIdentifier();
      const channelName = `🎫︱ticket-${uniqueIdentifier}`;

      const guild = interaction.guild;

      // Ensure guild object exists
      if (!guild) {
        console.error('Guild not found in interaction.');
        return;
      }

      const channel = await guild.channels.create({
        name: channelName,
        type: ChannelType.GuildText,
        parent: '1198605134729584750', // Replace with your category ID
        permissionOverwrites: [
          // Allow the user to view and send messages
          {
            id: user.id,
            allow: [
              PermissionsBitField.Flags.ViewChannel,
              PermissionsBitField.Flags.SendMessages,
            ],
          },
          // Deny access for everyone else
          {
            id: guild.roles.everyone.id,
            deny: [PermissionsBitField.Flags.ViewChannel],
          },
        ],
      });

      if (channel) {
        // Send an embed message to the user's ticket channel
        const embedMessage = new EmbedBuilder()
          .setColor('#3498db')
          .setTitle('Ticket Created')
          .setDescription(
            `Thank you for creating a ticket, ${user.username}! A support representative will be with you shortly.`
          );
        await channel.send({ embeds: [embedMessage] });

        // Send notification to the support channel
        const supportChannel = guild.channels.cache.get('1198629640718274600'); // Replace with your support channel ID

        if (supportChannel) {
          const notificationEmbed = new EmbedBuilder()
            .setThumbnail(user.avatarURL())
            .setColor('#ff0000')
            .setTitle('New Ticket')
            .setDescription(
              `${user.username} has created a new ticket. Click below to join.`
            );

          const notificationRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setLabel('View Ticket')
              .setStyle('Link')
              .setURL(
                `https://discord.com/channels/${guild.id}/${channel.id}`
              )
          );

          await supportChannel.send({
            embeds: [notificationEmbed],
            components: [notificationRow],
          });
        } else {
          console.error('Support channel not found!');
        }

        await interaction.reply('Ticket created successfully!');
      } else {
        console.error('Failed to create ticket channel for user:', user.id);
      }
    } else if (interaction.isButton()) {
      const user = interaction.user;
      const guild = interaction.guild;

      // Ensure guild object exists
      if (!guild) {
        console.error('Guild not found in interaction.');
        return;
      }

      const channel = guild.channels.cache.find(
        (ch) => ch.name === `🎫︱ticket-${user.id}`
      );

      console.log('Channel Name:', `🎫︱ticket-${user.id}`);
      console.log('Guild Channel Cache:', guild.channels.cache);

      if (channel) {
        // You can add additional logic here if needed
      } else {
        console.error('Ticket channel not found!');
      }
    }
  },
};
