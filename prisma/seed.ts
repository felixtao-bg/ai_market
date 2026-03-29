/**
 * 将本机 Cursor Skills 写入市场（第一批种子数据）。
 * 默认扫描：$HOME/.cursor/skills 与 $HOME/.cursor/skills-cursor
 *
 * 运行：npx prisma db seed
 */
import { existsSync, readFileSync, readdirSync, statSync } from "fs";
import { join } from "path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SEED_USER_EMAIL = "seed-cursor-skills@local.ai-market";
const SEED_TAG = "cursor,skill,seed-batch-one";

function slugifySegment(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

function parseSkillMd(content: string): { name: string; description: string } {
  const fallbackName = "cursor-skill";
  if (!content.startsWith("---")) {
    return {
      name: fallbackName,
      description: content.trim().slice(0, 800),
    };
  }

  const end = content.indexOf("\n---", 3);
  if (end === -1) {
    return {
      name: fallbackName,
      description: content.trim().slice(0, 800),
    };
  }

  const fm = content.slice(4, end);
  const nameM = fm.match(/^name:\s*(.+)$/m);
  const name = (nameM?.[1] ?? fallbackName).trim();

  let description = "";

  const pipe = fm.match(/^description:\s*\|\s*\n([\s\S]*)/m);
  if (pipe) {
    const lines = pipe[1].split("\n");
    for (const line of lines) {
      if (/^[a-zA-Z_][a-zA-Z0-9_]*:\s/.test(line.trim()) && !line.startsWith(" ")) {
        break;
      }
      description += (description ? "\n" : "") + line.replace(/^\s{2}/, "");
    }
  } else {
    const folded = fm.match(/^description:\s*>\-?\s*\n([\s\S]*)/m);
    if (folded) {
      const lines = folded[1].split("\n");
      for (const line of lines) {
        if (
          line.length > 0 &&
          !/^\s/.test(line) &&
          /^[a-zA-Z_][a-zA-Z0-9_]*:/.test(line)
        ) {
          break;
        }
        description += (description ? " " : "") + line.trim();
      }
    } else {
      const one = fm.match(/^description:\s*(.+)$/m);
      description = one?.[1]?.trim() ?? "";
    }
  }

  description = description.replace(/\s+/g, " ").trim().slice(0, 1500);
  if (!description) {
    description = `Cursor Agent Skill「${name}」。详见本机 SKILL.md。`;
  }

  return { name, description };
}

type SkillRoot = "user" | "bundled";

function collectSkillDirs(base: string, root: SkillRoot): { dir: string; root: SkillRoot; path: string }[] {
  if (!existsSync(base)) return [];
  const out: { dir: string; root: SkillRoot; path: string }[] = [];
  for (const name of readdirSync(base)) {
    if (name.startsWith(".")) continue;
    const full = join(base, name);
    if (!statSync(full).isDirectory()) continue;
    const skillMd = join(full, "SKILL.md");
    if (existsSync(skillMd)) {
      out.push({ dir: name, root, path: skillMd });
    }
  }
  return out;
}

async function main() {
  const home = process.env.HOME ?? process.env.USERPROFILE ?? "";
  const userSkills = join(home, ".cursor", "skills");
  const bundledSkills = join(home, ".cursor", "skills-cursor");

  const entries = [
    ...collectSkillDirs(userSkills, "user"),
    ...collectSkillDirs(bundledSkills, "bundled"),
  ];

  if (entries.length === 0) {
    console.warn(
      "未找到任何 SKILL.md。请确认目录存在：\n",
      userSkills,
      "\n",
      bundledSkills,
    );
    return;
  }

  const user = await prisma.user.upsert({
    where: { email: SEED_USER_EMAIL },
    create: {
      email: SEED_USER_EMAIL,
      name: "Cursor 技能（种子）",
    },
    update: { name: "Cursor 技能（种子）" },
  });

  let n = 0;
  for (const { dir, root, path: mdPath } of entries) {
    const raw = readFileSync(mdPath, "utf8");
    const { name, description } = parseSkillMd(raw);
    const prefix = root === "user" ? "skill-user" : "skill-cursor";
    const slug = `${prefix}-${slugifySegment(dir)}`;

    const homeHint =
      root === "user"
        ? `~/.cursor/skills/${dir}`
        : `~/.cursor/skills-cursor/${dir}`;

    const distribution = {
      docUrl: "https://cursor.com/docs/agent/skills",
      installHint: `本机 Skill 目录（请按你的系统替换 ~）：\n${homeHint}\n\n文件：SKILL.md\n\n说明：此为种子导入，仅描述你电脑上的 Cursor 技能；他人需自行安装同名技能或拷贝 SKILL.md。`,
    };

    const tagExtra = root === "user" ? "user-skills" : "skills-cursor";
    const tags = `${SEED_TAG},${tagExtra}`;

    await prisma.product.upsert({
      where: { slug },
      create: {
        ownerId: user.id,
        type: "skill",
        slug,
        title: name,
        description,
        tags,
        pricingModel: "free",
        priceCents: 0,
        currency: "usd",
        distribution,
        status: "published",
        viewCount: Math.max(0, 80 - n * 7),
      },
      update: {
        title: name,
        description,
        tags,
        distribution,
        status: "published",
        type: "skill",
        pricingModel: "free",
        priceCents: 0,
      },
    });
    n += 1;
    console.log("Seeded:", slug, "←", mdPath);
  }

  console.log(`完成：共 ${n} 条 Skill 已写入或更新（热度初值略有差异，便于立刻看到排序）。`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
