import { readdir, readFile, writeFile } from "node:fs/promises";
import { join, extname } from "node:path";

const jsonsPath = process.argv[2];
const filelist = (await readdir(jsonsPath, { recursive: true, withFileTypes: true }))
  .filter((file) => extname(file.name) === ".json")
  .map((file) => join(file.parentPath, file.name));

const mapping: [string, string][] = [
  ["hflesh", "meat_allergen"],
  ["iflesh", "meat_allergen"],
  ["flesh", "meat_allergen"],
  ["blood", "meat_allergen"],
  ["hblood", "meat_allergen"],
  ["bone", "meat_allergen"],
  ["veggy", "veggy_allergen"],
  ["dried_vegetable", "veggy_allergen"],
  ["bean", "veggy_allergen"],
  ["tomato", "veggy_allergen"],
  ["garlic", "veggy_allergen"],
  ["mushroom", "veggy_allergen"],
  ["wheat", "wheat_allergen"],
  ["egg", "egg_allergen"],
  ["fruit", "fruit_allergen"],
  ["junk", "junk_allergen"],
  ["milk", "milk_allergen"]
];
filelist.forEach(async (filePath) => {
  let dirty = false;
  const json: unknown = JSON.parse(await readFile(filePath, "utf-8"));

  if (Array.isArray(json)) {
    json.forEach((item: unknown) => {
      if (
        // check if item is comestible and has material(s) defined
        item &&
        typeof item === "object" &&
        "type" in item &&
        item.type === "COMESTIBLE" &&
        "material" in item &&
        Array.isArray(item.material)
      ) {
        // Reduce material list to strings in case it's a complex definition
        const materials: string[] = item.material.map((material) => {
          if (typeof material === "object" && "type" in material && typeof material.type === "string")
            return material.type;
          else if (typeof material === "string") return material;
          else return "";
        });
        mapping.forEach(([mat, allergen]) => {
          if (materials.includes(mat)) {
            // Vitamins is defined
            if ("vitamins" in item && Array.isArray(item.vitamins)) {
              if (!item.vitamins.flat().includes(allergen)) {
                item.vitamins.push([allergen, 1]);
                dirty = true;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                console.log((item as any).id, " has ", mat, ", now also has ", allergen);
              }
              // Vitamins isn't defined, we need to add it
            } else {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (item as any)["vitamins"] = [[allergen, 1]];
              dirty = true;
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              console.log((item as any).id, " has ", mat, ", now also has ", allergen);
            }
          }
        });
      }
    });
  }
  if (dirty) {
    await writeFile(filePath, JSON.stringify(json));
  }
});
