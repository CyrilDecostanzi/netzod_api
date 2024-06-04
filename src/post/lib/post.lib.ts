import { CreatePostDto } from '../dto/create-post.dto';
import { UpdatePostDto } from '../dto/update-post.dto';
import { Post } from '../entities/post.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

export class PostLib {
  constructor(
    @InjectRepository(Post) private postRepository: Repository<Post>,
  ) {}

  async slugifier(text: string, currentSlug?: string): Promise<string> {
    // Normaliser et nettoyer le texte pour créer un slug de base
    const normalizedText = text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .replace(/[^a-zA-Z0-9\s]/g, '') // Remove non-alphanumeric chars
      .trim() // Trim leading/trailing whitespace
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .toLowerCase();

    // Vérifier si le slug actuel est déjà correct
    if (currentSlug === normalizedText) {
      return currentSlug;
    }

    // Récupérer les slugs similaires directement
    const similarSlugs = await this.postRepository
      .createQueryBuilder('post')
      .withDeleted()
      .select('post.slug')
      .where('post.slug LIKE :slug', { slug: `${normalizedText}%` })
      .getMany();

    // Extraire les suffixes numériques et trouver le prochain suffixe
    const suffixes = similarSlugs
      .map(({ slug }) => {
        const match = slug.match(new RegExp(`^${normalizedText}-(\\d+)$`));
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter((suffix) => !isNaN(suffix));

    // Déterminer le prochain suffixe disponible
    const nextSuffix = suffixes.length ? Math.max(...suffixes) + 1 : 0;

    // Générer le nouveau slug
    const newSlug =
      nextSuffix === 0 ? normalizedText : `${normalizedText}-${nextSuffix}`;

    // Vérifier la disponibilité finale du slug en une seule requête
    const existingSlug = await this.postRepository.findOne({
      where: { slug: newSlug },
    });

    if (existingSlug) {
      return `${normalizedText}-${nextSuffix + 1}`;
    }

    return newSlug;
  }

  async createPost(createPostDto: CreatePostDto, req: any) {
    const post = new Post(createPostDto);
    post.slug = await this.slugifier(post.title);
    post.user_id = req.user.id;
    return post;
  }

  async updatePost(post: Post, updatePostDto: UpdatePostDto) {
    const updatedData = new Post(updatePostDto);

    if (updatePostDto.title) {
      updatedData.slug = await this.slugifier(updatePostDto.title, post.slug);
    }
    return new Post({
      ...post,
      ...updatedData,
    });
  }
}
