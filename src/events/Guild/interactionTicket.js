module.exports = {
  event: "interactionCreate",

  run: async (client, interaction) => {
    if (!interaction.isButton()) return;

    const user = interaction.user;
    const channel = interaction.guild.channels.cache.find(
      (ch) => ch.name === `🎫︱ticket-${user.id}`
    );

    console.log("Channel Name:", `🎫︱ticket-${user.id}`);
    console.log("Guild Channel Cache:", interaction.guild.channels.cache);

    if (channel) {
      // You can add additional logic here if needed
    } else {
      console.error("Ticket channel not found!");
    }
  },
};
