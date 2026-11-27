// Nx release changelog renderer for Version Plans (nx.json `release.changelog.projectChangelogs.renderer`).
//
// Nx orders Version Plans by file birth time, which a checkout does not keep, and renders breaking changes after
// features and fixes. This renderer makes the entry deterministic and leads with what a reader must act on:
//
// - Sections render as Breaking Changes (`bump: major`), then Features (`minor`), then Fixes (`patch`).
// - Within a section, a plan whose message starts with `<!-- order: N -->` renders by ascending N; plans without one
//   follow in Nx's order. The marker is stripped from the output.
// - Every version's title is a level-2 heading, a major one included (Nx's default makes a major `#`): `# Changelog`
//   is the document's title, and `scripts/ci-release.mjs` finds an entry by its `## <version>` line.
//
// Anything not Version Plan based renders exactly as Nx's default renderer.

const DefaultChangelogRenderer = require('nx/release/changelog-renderer').default;

const ORDER = /^<!--\s*order:\s*(\d+)\s*-->\s*/;

const rank = (change) => {
  const match = ORDER.exec(change.description ?? '');
  return match ? Number(match[1]) : Number.MAX_SAFE_INTEGER;
};

class OrderedChangelogRenderer extends DefaultChangelogRenderer {
  preprocessChanges() {
    if (this.isVersionPlans) {
      // `sort` is stable: unmarked plans keep Nx's order after the marked ones.
      this.changes = [...this.changes]
        .sort((a, b) => rank(a) - rank(b))
        .map((change) => ({ ...change, description: change.description.replace(ORDER, '') }));
    }
    super.preprocessChanges();
    // Nx collects Version Plan breaking changes from the last change to the first.
    if (this.isVersionPlans) this.breakingChanges.reverse();
  }

  // Nx reverses each type's changes for the workspace changelog and keeps them for a project's; both keep ours.
  renderChangesByType() {
    if (!this.isVersionPlans) return super.renderChangesByType();
    const lines = [];
    const groups = this.groupChangesByType();
    for (const [type, { changelog }] of Object.entries(this.conventionalCommitsConfig.types)) {
      if (!changelog || !groups[type]?.length) continue;
      lines.push('', `### ${changelog.title}`, '', ...groups[type].map((change) => this.formatChange(change)));
    }
    return lines;
  }

  renderVersionTitle() {
    return super.renderVersionTitle().replace(/^#\s/u, '## ');
  }

  async render() {
    if (!this.isVersionPlans) return super.render();
    this.preprocessChanges();
    if (this.shouldRenderEmptyEntry()) return this.renderEmptyEntry();
    const sections = [[this.renderVersionTitle()]];
    if (this.hasBreakingChanges()) sections.push(this.renderBreakingChanges());
    sections.push(this.renderChangesByType());
    if (this.hasDependencyBumps()) sections.push(this.renderDependencyBumps());
    if (this.shouldRenderAuthors()) sections.push(await this.renderAuthors());
    return sections
      .filter((section) => section.length > 0)
      .map((section) => section.join('\n').trim())
      .join('\n\n')
      .trim();
  }
}

module.exports = OrderedChangelogRenderer;
module.exports.default = OrderedChangelogRenderer;
