import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    // Check if user with this email already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email }
    });

    if (existingUser) {
      const error = new Error('Email already exists');
      error['statusCode'] = 409;
      throw error;
    }

    const user = new User();
    user.firstName = createUserDto.firstName;
    user.lastName = createUserDto.lastName;
    user.email = createUserDto.email;
    
    // Hash the password before saving
    const saltRounds = 10;
    user.password = await bcrypt.hash(createUserDto.password, saltRounds);
    
    user.createdAt = new Date();
    user.updatedAt = new Date();
    
    try {
      const savedUser = await this.userRepository.save(user);
      
      // Generate a simple token (you might want to use JWT in production)
      const token = Buffer.from(`${savedUser.id}:${savedUser.email}:${Date.now()}`).toString('base64');
      
      // Return response with token and user data (excluding password)
      const { password, ...userWithoutPassword } = savedUser;
      
      return {
        token,
        user: userWithoutPassword,
        message: 'User created successfully'
      };
    } catch (error) {
      throw new Error(`Failed to save user: ${error.message}`);
    }
  }

  async login(loginUserDto: LoginUserDto) {
    try {
      // Find user by email
      const user = await this.userRepository.findOne({
        where: { email: loginUserDto.email }
      });

      if (!user) {
        const error = new Error('Invalid email or password');
        error['statusCode'] = 422;
        throw error;
      }

      // Compare the provided password with stored hashed password
      const isPasswordValid = await bcrypt.compare(loginUserDto.password, user.password);
      
      if (!isPasswordValid) {
        const error = new Error('Invalid email or password');
        error['statusCode'] = 422;
        throw error;
      }

      // Generate a simple token (you might want to use JWT in production)
      const token = Buffer.from(`${user.id}:${user.email}:${Date.now()}`).toString('base64');
      
      // Return response with token and user data (excluding password)
      const { password, ...userWithoutPassword } = user;
      
      return {
        token,
        user: userWithoutPassword,
        message: 'Login successful'
      };
    } catch (error) {
      if (error['statusCode']) {
        throw error;
      }
      throw new Error(`Login failed: ${error.message}`);
    }
  }

  async findAll() {
    try {
      const users = await this.userRepository.find();
      
      // Remove passwords from all users
      const usersWithoutPasswords = users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      
      return {
        users: usersWithoutPasswords,
        count: usersWithoutPasswords.length,
        message: 'Users retrieved successfully'
      };
    } catch (error) {
      throw new Error(`Failed to retrieve users: ${error.message}`);
    }
  }

  async findOne(id: number) {
    try {
      const user = await this.userRepository.findOne({
        where: { id }
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Remove password from user data
      const { password, ...userWithoutPassword } = user;
      
      return {
        user: userWithoutPassword,
        message: 'User retrieved successfully'
      };
    } catch (error) {
      throw new Error(`Failed to retrieve user: ${error.message}`);
    }
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    try {
      // Validate that id is a valid number
      if (isNaN(id) || id <= 0) {
        throw new Error('Invalid user ID provided');
      }

      // First check if user exists
      const existingUser = await this.userRepository.findOne({
        where: { id }
      });

      if (!existingUser) {
        throw new Error('User not found');
      }

      // Update the user with new data
      const updatedUser = await this.userRepository.save({
        ...existingUser,
        ...updateUserDto,
        updatedAt: new Date()
      });

      // Remove password from returned user data
      const { password, ...userWithoutPassword } = updatedUser;
      
      return {
        user: userWithoutPassword,
        message: 'User updated successfully'
      };
    } catch (error) {
      throw new Error(`Failed to update user: ${error.message}`);
    }
  }

  async remove(id: number) {
    try {
      // Validate that id is a valid number
      if (isNaN(id) || id <= 0) {
        throw new Error('Invalid user ID provided');
      }

      // First check if user exists
      const existingUser = await this.userRepository.findOne({
        where: { id }
      });

      if (!existingUser) {
        throw new Error('User not found');
      }

      // Delete the user
      await this.userRepository.remove(existingUser);
      
      return {
        message: 'User deleted successfully'
      };
    } catch (error) {
      throw new Error(`Failed to delete user: ${error.message}`);
    }
  }

  async getProfile(token: string) {
    try {
      // Decode the token (reverse of the encoding we used in create/login)
      const decodedToken = Buffer.from(token, 'base64').toString('utf-8');
      const [userId] = decodedToken.split(':');
      
      if (!userId) {
        throw new Error('Invalid token');
      }

      // Find user by ID
      const user = await this.userRepository.findOne({
        where: { id: parseInt(userId) }
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Return user data without password
      const { password, ...userWithoutPassword } = user;
      
      return {
        user: userWithoutPassword,
        message: 'Profile retrieved successfully'
      };
    } catch (error) {
      throw new Error(`Failed to get profile: ${error.message}`);
    }
  }

  getUserIdFromToken(token: string): number {
    try {
      // Decode the token (reverse of the encoding we used in create/login)
      const decodedToken = Buffer.from(token, 'base64').toString('utf-8');
      console.log('Decoded token:', decodedToken); // Debug log
      
      const [userId] = decodedToken.split(':');
      console.log('Extracted userId:', userId); // Debug log
      
      if (!userId) {
        throw new Error('Invalid token format');
      }

      const parsedUserId = parseInt(userId);
      console.log('Parsed userId:', parsedUserId); // Debug log
      
      if (isNaN(parsedUserId)) {
        throw new Error('Invalid user ID in token');
      }

      return parsedUserId;
    } catch (error) {
      throw new Error(`Invalid token: ${error.message}`);
    }
  }
}
