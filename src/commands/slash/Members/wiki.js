const {SlashCommandBuilder} = require('@discordjs/builders');
const {ActionRowBuilder, ButtonBuilder, EmbedBuilder} = require('discord.js');
const axios = require('axios');
const cheerio = require('cheerio');

const baseUrl = 'https://wiki-corsairs.talesofpirates.net';
const url = `${baseUrl}/index.php?title=Main_Page`;

async function fetchData() {
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    const selectedRows =
        $('#mw-content-text > div.mw-parser-output > table > tbody > tr');
    const anchors = [];

    selectedRows.each((rowIndex, rowElement) => {
      const selectedAnchors = $(rowElement).find('td > a');

      selectedAnchors.each((anchorIndex, anchorElement) => {
        const textContent = $(anchorElement).text();
        const url = $(anchorElement).attr('href');
        anchors.push({text: textContent, url: baseUrl + url});
      });
    });

    return anchors.length > 0 ? anchors : null;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
}

// Create the command builder
const commandBuilder =
    new SlashCommandBuilder()
        .setName('wiki')
        .setDescription('Search for keywords in the directory index')
        .addSubcommand(
            (subcommand) =>
                subcommand.setName('search')
                    .setDescription('Search for a specific keyword')
                    .addStringOption(
                        (option) =>
                            option.setName('keyword')
                                .setDescription('Enter a keyword to search')
                                .setRequired(true)))
        .addSubcommand(
            (subcommand) =>
                subcommand.setName('all').setDescription('Show all results'));

// Export the command builder
module.exports = {
  structure: commandBuilder,

  run: async (client, interaction, args) => {
    try {
      await interaction.deferReply();

      // Fetch data
      const anchors = await fetchData();

      // Check for errors
      if (!anchors) {
        await interaction.followUp(
          'Error fetching data. Please try again later.'
        );
        return;
      }

      // Handle command logic based on subcommand
      const subcommand = interaction.options.getSubcommand();
      if (subcommand === 'search') {
        const keyword = interaction.options.getString('keyword');
        const matchingResults = anchors.filter((anchor) =>
          anchor.text.toLowerCase().includes(keyword.toLowerCase())
        );

        if (matchingResults.length > 0) {
          const embed = new EmbedBuilder()
            .setTitle('Matching Results:')
            .setColor('Random');

          matchingResults.forEach((anchor, index) => {
            const truncatedText = anchor.text.substring(0, 4096);
            embed.addFields({
              name: `${truncatedText}`,
              value: `${anchor.url}`,
              inline: false,
            });
          });

          await interaction.followUp({ embeds: [embed] });
        } else {
          await interaction.followUp('No matching results found.');
        }
      } else if (subcommand === 'all') {
        const pageSize = 8; // Adjusted to display 8 fields per page
        const totalResults = anchors.length;

        const pages = Math.ceil(totalResults / pageSize);
        let currentPage = 1;

        const updateEmbed = async () => {
          const startIdx = (currentPage - 1) * pageSize;
          const endIdx = startIdx + pageSize;
          const currentResults = anchors.slice(startIdx, endIdx);

          const embed = new EmbedBuilder()
            .setTitle(`All Results - Page ${currentPage}/${pages}`)
            .setColor('Blue');

          for (let i = 0; i < currentResults.length; i++) {
            const anchor = currentResults[i];
            const truncatedText = anchor.text.substring(0, 4096);
            embed.addFields({
              name: `${truncatedText}`,
              value: `${anchor.url}`,
              inline: false,
            });
          }

          return embed;
        };

        const initialEmbed = await updateEmbed();
        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId('prev')
            .setLabel('Back')
            .setStyle('Primary'),
          new ButtonBuilder()
            .setCustomId('next')
            .setLabel('Next')
            .setStyle('Success')
        );

        const message = await interaction.followUp({
          embeds: [initialEmbed],
          components: [row],
        });

        const filter = (i) => i.customId === 'prev' || i.customId === 'next';
        const collector = message.createMessageComponentCollector({
          filter,
          time: 60000, // 1 minute timeout
        });

        collector.on('collect', async (i) => {
          if (i.customId === 'prev' && currentPage > 1) {
            currentPage--;
          } else if (i.customId === 'next' && currentPage < pages) {
            currentPage++;
          }

          const updatedEmbed = await updateEmbed();
          await i.update({ embeds: [updatedEmbed] });
        });

        collector.on('end', () => {
          row.components.forEach((component) => (component.disabled = true));
          message.edit({ components: [row] });
        });
      }
    } catch (error) {
      console.error('Error during command execution:', error);
      await interaction.followUp('An error occurred during command execution.');
    }
  },
};
