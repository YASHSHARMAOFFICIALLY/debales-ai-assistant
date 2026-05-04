import mongoose, { Schema, Types } from "mongoose";

export interface ProjectDoc {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  description: string;
}

export interface UserDoc {
  _id: Types.ObjectId;
  userId: string;
  name: string;
  email: string;
  projectRoles: { projectId: Types.ObjectId; role: "admin" | "member" }[];
}

export interface ProductInstanceDoc {
  _id: Types.ObjectId;
  projectId: Types.ObjectId;
  namespace: string;
  name: string;
  productType: "ai-sales-assistant";
  integrations: { shopify: boolean; crm: boolean };
  shellNav: { id: string; label: string; href: string; enabled: boolean }[];
}

export interface ConversationDoc {
  _id: Types.ObjectId;
  projectId: Types.ObjectId;
  productInstanceId: Types.ObjectId;
  title: string;
  messages: { _id: Types.ObjectId; role: "user" | "assistant" | "step"; content: string; createdAt: Date }[];
  createdAt: Date;
  updatedAt: Date;
}

export interface DashboardConfigDoc {
  _id: Types.ObjectId;
  projectId: Types.ObjectId;
  title: string;
  subtitle?: string;
  sections: unknown[];
  updatedAt: Date;
}

const ProjectSchema = new Schema<ProjectDoc>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, required: true },
  },
  { timestamps: true },
);

const UserSchema = new Schema<UserDoc>(
  {
    userId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    projectRoles: [
      {
        projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
        role: { type: String, enum: ["admin", "member"], required: true },
      },
    ],
  },
  { timestamps: true },
);

const ProductInstanceSchema = new Schema<ProductInstanceDoc>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true, index: true },
    namespace: { type: String, required: true },
    name: { type: String, required: true },
    productType: { type: String, enum: ["ai-sales-assistant"], required: true },
    integrations: {
      shopify: { type: Boolean, default: true },
      crm: { type: Boolean, default: true },
    },
    shellNav: [
      {
        id: { type: String, required: true },
        label: { type: String, required: true },
        href: { type: String, required: true },
        enabled: { type: Boolean, default: true },
      },
    ],
  },
  { timestamps: true },
);

const ConversationSchema = new Schema<ConversationDoc>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true, index: true },
    productInstanceId: { type: Schema.Types.ObjectId, ref: "ProductInstance", required: true, index: true },
    title: { type: String, required: true },
    messages: [
      {
        role: { type: String, enum: ["user", "assistant", "step"], required: true },
        content: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true },
);

const DashboardConfigSchema = new Schema<DashboardConfigDoc>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true, unique: true, index: true },
    title: { type: String, required: true },
    subtitle: { type: String },
    sections: { type: [Schema.Types.Mixed], required: true },
  },
  { timestamps: true },
);

export const ProjectModel = mongoose.models.Project || mongoose.model<ProjectDoc>("Project", ProjectSchema);
export const UserModel = mongoose.models.User || mongoose.model<UserDoc>("User", UserSchema);
export const ProductInstanceModel =
  mongoose.models.ProductInstance || mongoose.model<ProductInstanceDoc>("ProductInstance", ProductInstanceSchema);
export const ConversationModel =
  mongoose.models.Conversation || mongoose.model<ConversationDoc>("Conversation", ConversationSchema);
export const DashboardConfigModel =
  mongoose.models.DashboardConfig || mongoose.model<DashboardConfigDoc>("DashboardConfig", DashboardConfigSchema);
