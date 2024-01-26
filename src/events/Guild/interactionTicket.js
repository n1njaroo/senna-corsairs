const {
  ModalBuilder,
  TextInputBuilder,
  ActionRowBuilder,
  TextInputStyle,
  ChannelType,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionsBitField,
} = require("discord.js");
const { createTranscript } = require("discord-html-transcripts");
const ticket = require("../../schemas/TicketSchema");

module.exports = {
  event: "interactionCreate",
  /**
   *
   * @param {ExtendedClient} client
   * @param {import('discord.js').Interaction} interaction
   * @returns
   */
  run: async (interaction, client) => {
    if (interaction.customId == "ticketCreateSelect") {
      const modal = new ModalBuilder()
        .setTitle("Create your ticket")
        .setCustomId("ticketModal");

      const why = new TextInputBuilder()
        .setCustomId("whyTicket")
        .setRequired(true)
        .setPlaceholder("What is the reason for creating this  ticket")
        .setLabel("Why are you creating this ticket?")
        .setStyle(TextInputStyle.Paragraph);

      const info = new TextInputBuilder()
        .setCustomId("infoTicket")
        .setRequired(false)
        .setPlaceholder("Fell free to leave this blank")
        .setLabel("Provide us with any additional information")
        .setStyle(TextInputStyle.Paragraph);

      const one = new ActionRowBuilder().addComponents(why);
      const two = new ActionRowBuilder().addComponents(info);

      modal.addComponents(one, two);
      await interaction.showModal(modal);
    } else if (interaction.customId == "ticketModal") {
      const user = interaction.user;
      const data = await ticket.findOne({ Guild: interaction.guild.id });

      if (!data) {
        return interaction.reply({
          content:
            "Sorry! Looks like you found this message but the ticket system is not set up yet. Do /ticket setup before you can send a ticket",
          ephemeral: true,
        });
      } else {
        const why = interaction.fields.getTextInput("whyTicket");
        const info = interaction.fields.getTextInput("infoTicket");
        const category = await interaction.guild.channels.cache.get(
          data.Category
        );

        const channel = await interaction.guild.channels.create({
          name: `ticket-${user.id}`,
          type: ChannelType.GuildText,
          topic: `Ticket user: ${user.username}; ticket reason: ${why}`,
          parent: category,
          permissionOverwrites: [
            {
              id: interaction.guild.id,
              deny: [PermissionsBitField.Flags.ViewChannel],
            },
            {
              id: interaction.user.id,
              allow: [
                PermissionsBitField.Flags.ViewChannel,
                PermissionsBitField.Flags.SendMessages,
                PermissionsBitField.Flags.ReadMessageHistory,
              ],
            },
          ],
        });

        const embed = new EmbedBuilder()
          .setColor("RANDOM")
          .setTitle("Ticket Created for " + user.username)
          .setDescription(
            "Ticket reason: " + why + "\n\nAdditional Information: " + info
          )
          .setTimestamp();

        const button = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("closeTicket")
            .setLabel("Close Ticket")
            .setStyle(ButtonStyle.Danger),

          new ButtonBuilder()
            .setCustomId("ticketTranscript")
            .setLabel("Transcript")
            .setStyle(ButtonStyle.Primary)
        );

        await channel.send({
          embeds: [embed],
          components: [button],
        });
        await interaction.reply({
          content: `Your ticket has been opened in ${channel}`,
          ephemeral: true,
        });
      }
    } else if (interaction.customId === "closeTicket") {
      const closeModal = new ModalBuilder()
        .setTitle("Close Ticket")
        .setCustomId("closeTicketModal");

      const reason = new TextInputBuilder()
        .setCustomId("closeTicketModal")
        .setRequired(true)
        .setPlaceholder("What is the reason for closing this ticket")
        .setLabel("Provide a reason for closing this ticket")
        .setStyle(TextInputStyle.Paragraph);

      const one = new ActionRowBuilder().addComponents(reason);

      closeModal.addComponents(one);
      await interaction.showModal(closeModal);
    } else if (interaction.customId === "closeTicketModal") {
      var channel = interaction.channel;
      var name = channel.name;
      name = name.replace("ticket-", "");
      const member = await interaction.guild.members.cache.get(name);

      const reason = interaction.fields.getTextInputValue("closeReasonTicket");
      await interaction.reply({
        content: "Closing ticket...",
        ephemeral: true,
      });

      setTimeout(async () => {
        await channel.delete().catch(() => {});
        await member
          .send(
            `Your ticket in ${interaction.guild.name} has been closed for the following reason: ${reason}`
          )
          .catch(() => {});
      }, 5000);
    } else if (interaction.customId == "ticketTranscript") {
      const file = await createTranscript(interaction.channel, {
        limit: -1,
        returnBuffer: false,
        filename: `${interaction.channel.name}.transcript.html`,
      });

      const msg = await interaction.channel.send({
        content: `Here is your transcript cache:`,
        files: [file],
      });
      const message = `Here is your [transcript](https://mahto.id/chat-exporter?url=${
        msg.attachments.first().url
      }) from ${interaction.guild.name}!`;
      await msg.delete().catch((err) => {});
      await interaction.reply({ content: message, ephemeral: true });
    }
  },
};
