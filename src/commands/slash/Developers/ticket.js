const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ChannelType,
  PermissionsBitField,
} = require("discord.js");
const ticket = require("../../../schemas/TicketSchema");

module.exports = {
  structure: new SlashCommandBuilder()
    .setName("ticket")
    .setDescription("Manage the ticket system")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("send")
        .setDescription("Send the ticket message")
        .addStringOption((option) =>
          option
            .setName("name")
            .setDescription("The name for the open select menu content")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("message")
            .setDescription("A custom message to add the embed")
            .setRequired(false)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("setup")
        .setDescription("Setup the ticket category")
        .addChannelOption((option) =>
          option
            .setName("category")
            .setDescription("The category to set up the ticket system")
            .addChannelTypes(ChannelType.GuildCategory)
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand.setName("remove").setDescription("Close the ticket")
    )
    .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator),

  run: async (client, interaction, args) => {
    try {
      const { options } = interaction;
      const sub = options.getSubcommand();
      const data = await ticket.findOne({ Guild: interaction.guild.id });

      switch (sub) {
        case "send":
          if (!data)
            return await interaction.reply({
              content:
                "The ticket system is not set up yet. Do /ticket setup before you can send a ticket",
              ephemeral: true,
            });

          const name = options.getString("name");
          const message =
            options.getString("message") ||
            "Create a ticket to talk with the server staff! Once you selected below, use the input to describe why you are creating a ticket";

          const select = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
              .setCustomId("ticketCreateSelect")
              .setPlaceholder(name)
              .setMinValues(1)
              .addOptions({
                label: "Create your ticket",
                description: "Click to begin the ticket creation process",
                value: "createTicket",
              })
          );

          const embed = new EmbedBuilder()
            .setColor("Random")
            .setTitle("Create a ticket")
            .setDescription(message);

          await interaction.reply({
            content: "I have sent your ticket message below",
            ephemeral: true,
          });
          await interaction.followUp({
            embeds: [embed],
            components: [select],
          });
          break;

        case "remove":
          if (!data)
            return await interaction.reply({
              content:
                "The ticket system is not set up yet. Do /ticket setup before you can remove a ticket",
              ephemeral: true,
            });
          else {
            await ticket.deleteOne({ Guild: interaction.guild.id });
            await interaction.reply({
              content: "The ticket system has been removed",
              ephemeral: true,
            });
          }
          break;

        case "setup":
          if (data)
            return await interaction.reply({
              content: `Looks like you already have a ticket category set to <#${data.Category}>`,
              ephemeral: true,
            });
          else {
            const category = options.getChannel("category");
            await ticket.create({
              Guild: interaction.guild.id,
              Category: category.id,
            });
            await interaction.reply({
              content: `The ticket system has been set up in the category **<${category}>**`,
              ephemeral: true,
            });
          }
          break;
      }
    } catch (error) {
      console.error("An error occurred:", error);
      await interaction.reply({
        content: "An error occurred while processing your request.",
        ephemeral: true,
      });
    }
  },
};
