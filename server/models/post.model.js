const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const fs = require("fs");
const path = require("path");
const { promisify } = require("util");

const postSchema = new Schema(
  {
    content: {
      type: String,
      trim: true,
    },
    fileUrl: {
      type: String,
      trim: true,
    },
    fileType: {
      type: String,
    },
    community: {
      type: Schema.Types.ObjectId,
      ref: "Community",
      required: function () {
        return !this.club; // Required only if not a club post
      }
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    hashtags: {
      type: [String],
      index: true,
      default: [],
    },
    mentions: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    club: {
      type: Schema.Types.ObjectId,
      ref: "Club",
      default: null,
    },
    isPoll: {
      type: Boolean,
      default: false,
    },
    poll: {
      question: {
        type: String,
      },
      options: [
        {
          text: {
            type: String,
            required: true,
          },
          votes: [
            {
              type: Schema.Types.ObjectId,
              ref: "User",
            },
          ],
        },
      ],
    },
  },
  {
    timestamps: true,
  }
);

postSchema.index({ content: "text" });

postSchema.pre("remove", async function (next) {
  try {
    if (this.fileUrl) {
      const filename = path.basename(this.fileUrl);
      const deleteFilePromise = promisify(fs.unlink)(
        path.join(__dirname, "../assets/userFiles", filename)
      );
      await deleteFilePromise;
    }

    await this.model("Comment").deleteMany({ _id: this.comments });

    await this.model("Report").deleteOne({
      post: this._id,
    });

    await this.model("User").updateMany(
      {
        savedPosts: this._id,
      },
      {
        $pull: {
          savedPosts: this._id,
        },
      }
    );
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model("Post", postSchema);