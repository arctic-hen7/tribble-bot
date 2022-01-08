module.exports = (app) => {
    // We'll act on any newly opened issues
    app.on("issues.opened", newIssueHandler);
};

const newIssueHandler = async (ctx) => {
    // Get the parameters for this issue so that we can add labels to it and comment on it
    const params = ctx.issue();
    try {
        // Get the body of the issue so that we can parse it
        const data = await ctx.octokit.issues.get(params);
        console.log(data);
        // Get the labels out of that
        let labels = getRequestedLabels(data.body);
        // If we didn't find the appropriate formatting, we'll get `undefined`, in which case this issue wasn't created with Tribble and we should shut up
        if (labels === undefined) {
            return;
        }
        // Add the labels to that issue
        await ctx.octokit.issues.addLabels({ labels, ...params });
    } catch(err) {
        console.error(err);
        // We have an error, but we have the details of the issue, so comment on it
        let errBody = "This repo is set up to triage issues with [Tribble](https://github.com/arctic-hen7/tribble), but this issue couldn't be processed. If you deliberately didn't use Tribble to report this issue, you can safely ignore this warning. If you did, something's gone wrong here.";
        await ctx.octokit.issues.createComment({ body: errBody, ...params });
    }
};

// If Tribble's data format ever changes, we need to update this
const getRequestedLabels = (issueBody) => {
    // The relevant `<details>` block in a Tribble-formatted issue will always come at the end
    // We add to this because we need to get the actual contained text
    const detailsOpenIdx = issueBody.lastIndexOf("<details>\n<summary>Tribble internal data</summary>") + 51;
    const detailsCloseIdx = issueBody.lastIndexOf("</details>");
    // The indexing will return `-1` if it found nothing (but one had 51 added)
    if (detailsOpenIdx === 50 || detailsCloseIdx === -1) {
        return undefined;
    }
    const encoded = issueBody.substring(detailsOpenIdx, detailsCloseIdx).trim();
    // Now decode that
    let labelsString = Buffer.from(encoded, "base64").toString("utf-8");
    // We now have a list of tags delimited by ','
    let labels = labelsString.split(",");
    // GitHub has a very specific format it wants
    let githubLabels = labels.map(name => {
        return { name };
    });

    return githubLabels;
};

const test = `This report is reporting a bug. Description: test. Boolean: true

<details>
<summary>Tribble internal data</summary>

QzpidWcsQTpmcm9udGVuZA==

</details>`;
