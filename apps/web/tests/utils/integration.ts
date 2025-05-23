import { Project, User } from '@prisma/client';
import { type TaskContext } from 'vitest';
import { z } from 'zod';
import { HttpClient } from '../utils/http';
import { env, integrationTestEnv } from './env';

interface Resources {
  user: Pick<User, 'id'>;
  workspace: Pick<Project, 'id' | 'slug' | 'name'> & { workspaceId: string };
  apiKey: { token: string };
}

export class IntegrationHarness {
  private readonly ctx?: TaskContext;
  private env: z.infer<typeof integrationTestEnv>;
  public resources: Resources;
  public baseUrl: string;
  public http: HttpClient;

  constructor(ctx?: TaskContext) {
    this.env = env;
    this.ctx = ctx;
    this.baseUrl = this.env.E2E_BASE_URL;
    this.http = new HttpClient({
      baseUrl: `${this.baseUrl}/api`,
      headers: {
        'x-api-key': this.env.E2E_TOKEN,
        Authorization: `Bearer ${this.env.E2E_TOKEN}`,
      },
    });
  }

  async init() {
    const user = {
      id: this.env.E2E_USER_ID,
    };

    const apiKey = {
      token: this.env.E2E_TOKEN,
    };

    const workspace = {
      id: this.env.E2E_WORKSPACE_ID,
      slug: this.env.E2E_WORKSPACE_SLUG,
      name: this.env.E2E_WORKSPACE_NAME,
    };

    this.resources = {
      user,
      apiKey,
      workspace: {
        ...workspace,
        workspaceId: workspace.id,
      },
    };

    return { ...this.resources, http: this.http };
  }

  // Delete link
  public async deleteLink(id: string) {
    const { workspaceId } = this.resources.workspace;

    await this.http.delete({
      path: `/links/${id}`,
      query: { workspaceId },
    });
  }

  // Delete tag
  public async deleteTag(id: string) {
    const { workspaceId } = this.resources.workspace;

    await this.http.delete({
      path: `/tags/${id}`,
      query: { workspaceId },
    });
  }
}
