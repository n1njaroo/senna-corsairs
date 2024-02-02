const { SlashCommandBuilder } = require("@discordjs/builders");
const {
  ChannelType,
  PermissionsBitField,
  EmbedBuilder,
} = require("discord.js");

// Function to generate a random string as a unique identifier
function generateUniqueIdentifier() {
  return Math.random().toString(36).substring(2, 8);
}

module.exports = {
  structure: new SlashCommandBuilder()
    .setName("ticket")
    .setDescription(
      "Create a support ticket to get better assistance regarding your issue."
    ),

  options: {
    cooldown: 3000,
  },

  event: "interactionCreate",

  run: async (client, interaction, args) => {
    const user = interaction.user;
    const uniqueIdentifier = generateUniqueIdentifier();
    const channelName = `🎫︱ticket-${uniqueIdentifier}`;

    const channel = await interaction.guild.channels.create({
      name: channelName,
      type: ChannelType.GuildText,
      parent: "1198605134729584750",
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
          id: interaction.guild.roles.everyone.id,
          deny: [PermissionsBitField.Flags.ViewChannel],
        },
      ],
    });

    if (channel) {
      // Send an embed message to the user's ticket channel
      const embedMessage = new EmbedBuilder()
        .setColor("#3498db")
        .setTitle("Ticket Created")
        .setDescription(
          `Thank you for creating a ticket, ${user.username}! A support representative will be with you shortly.`
        );

      await channel.send({ embeds: [embedMessage] });

      // Send notification to the support channel
      const supportChannel = interaction.guild.channels.cache.get(
        "1198629640718274600"
      );

      if (supportChannel) {
        const notificationEmbed = new EmbedBuilder()
          .setColor("#ff0000")
          .setTitle("New Ticket")
          .setDescription(
            `${user.username} has created a new ticket. Click below to join.`
          );

        await supportChannel.send({
          embeds: [notificationEmbed],
        });
      } else {
        console.error("Support channel not found!");
      }

      await interaction.reply("Ticket created successfully!");
    } else {
      console.error("Failed to create ticket channel for user:", user.id);
    }
  },
};
