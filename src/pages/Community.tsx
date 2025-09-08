import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MessageSquare, 
  ThumbsUp, 
  Search, 
  Filter, 
  Plus,
  BookOpen,
  Users,
  Award,
  TrendingUp
} from "lucide-react";

const discussions = [
  {
    id: 1,
    title: "Best practices for wheat pest management?",
    author: "Rajesh Kumar",
    avatar: "RK",
    location: "Punjab",
    content: "I'm seeing some pest activity in my wheat fields. What are the most effective organic treatments you've used?",
    replies: 12,
    likes: 8,
    time: "2 hours ago",
    tags: ["wheat", "pest-control", "organic"]
  },
  {
    id: 2,
    title: "Soil preparation for monsoon planting",
    author: "Priya Sharma",
    avatar: "PS",
    location: "Haryana",
    content: "With monsoon approaching, what's the best way to prepare soil for rice cultivation? Any specific fertilizers recommended?",
    replies: 15,
    likes: 22,
    time: "5 hours ago",
    tags: ["rice", "soil-prep", "monsoon"]
  },
  {
    id: 3,
    title: "Market prices - when to sell wheat?",
    author: "Suresh Patel",
    avatar: "SP",
    location: "Gujarat",
    content: "Current wheat prices are ₹2,700/quintal. Should I sell now or wait for better rates? What are your thoughts?",
    replies: 8,
    likes: 6,
    time: "1 day ago",
    tags: ["wheat", "market", "pricing"]
  }
];

const knowledgeBase = [
  {
    id: 1,
    title: "Complete Guide to Organic Farming",
    category: "Sustainable Agriculture",
    author: "Dr. Amit Singh",
    reads: 1200,
    rating: 4.8,
    description: "Comprehensive guide covering soil preparation, crop selection, and pest management for organic farming."
  },
  {
    id: 2,
    title: "Water Management Techniques",
    category: "Irrigation",
    author: "Expert Team",
    reads: 950,
    rating: 4.6,
    description: "Efficient water usage methods including drip irrigation, mulching, and rainwater harvesting."
  },
  {
    id: 3,
    title: "Crop Rotation Strategies",
    category: "Soil Health",
    author: "Dr. Meena Rao",
    reads: 780,
    rating: 4.7,
    description: "Maximize soil health and yields through strategic crop rotation and intercropping techniques."
  }
];

const experts = [
  {
    name: "Dr. Rajesh Gupta",
    specialization: "Soil Science",
    location: "IARI, Delhi",
    rating: 4.9,
    answers: 342,
    avatar: "RG"
  },
  {
    name: "Sunita Devi",
    specialization: "Organic Farming",
    location: "Punjab",
    rating: 4.8,
    answers: 156,
    avatar: "SD"
  },
  {
    name: "Dr. Vikram Shah",
    specialization: "Pest Management",
    location: "Gujarat Agricultural University",
    rating: 4.7,
    answers: 289,
    avatar: "VS"
  }
];

const Community = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Community Hub</h1>
          <p className="text-muted-foreground">
            Connect with fellow farmers, share knowledge, and learn from experts
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Ask Question
        </Button>
      </div>

      {/* Community Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Members</p>
                <p className="text-2xl font-bold">2,847</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Questions Answered</p>
                <p className="text-2xl font-bold">15,432</p>
              </div>
              <MessageSquare className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Expert Articles</p>
                <p className="text-2xl font-bold">1,256</p>
              </div>
              <BookOpen className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Success Stories</p>
                <p className="text-2xl font-bold">892</p>
              </div>
              <Award className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="discussions" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="discussions">Discussions</TabsTrigger>
          <TabsTrigger value="knowledge">Knowledge Base</TabsTrigger>
          <TabsTrigger value="experts">Expert Network</TabsTrigger>
          <TabsTrigger value="success">Success Stories</TabsTrigger>
        </TabsList>

        <TabsContent value="discussions" className="space-y-4">
          {/* Search and Filter */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Input placeholder="Search discussions..." className="w-full" />
                </div>
                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter by Tags
                </Button>
                <Button variant="outline">
                  <Search className="w-4 h-4 mr-2" />
                  Advanced Search
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Discussion List */}
          <div className="space-y-4">
            {discussions.map((discussion) => (
              <Card key={discussion.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Avatar>
                      <AvatarFallback>{discussion.avatar}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold hover:text-primary cursor-pointer">
                          {discussion.title}
                        </h3>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {discussion.content}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {discussion.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-4">
                          <span>By {discussion.author} • {discussion.location}</span>
                          <span>{discussion.time}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <MessageSquare className="w-4 h-4" />
                            <span>{discussion.replies}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <ThumbsUp className="w-4 h-4" />
                            <span>{discussion.likes}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* New Discussion Form */}
          <Card>
            <CardHeader>
              <CardTitle>Start a New Discussion</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input placeholder="Discussion title..." />
              <Textarea placeholder="Share your question or experience..." />
              <div className="flex items-center gap-4">
                <Input placeholder="Add tags (comma separated)" className="flex-1" />
                <Button>Post Discussion</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="knowledge" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {knowledgeBase.map((article) => (
              <Card key={article.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">{article.category}</Badge>
                    <div className="flex items-center gap-1">
                      <Award className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm">{article.rating}</span>
                    </div>
                  </div>
                  <CardTitle className="text-lg">{article.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {article.description}
                  </p>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>By {article.author}</span>
                    <div className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      <span>{article.reads} reads</span>
                    </div>
                  </div>
                  <Button className="w-full mt-4" variant="outline">
                    Read Article
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="experts" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {experts.map((expert, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6 text-center">
                  <Avatar className="w-16 h-16 mx-auto mb-4">
                    <AvatarFallback className="text-lg">{expert.avatar}</AvatarFallback>
                  </Avatar>
                  <h3 className="font-semibold mb-1">{expert.name}</h3>
                  <p className="text-sm text-primary mb-2">{expert.specialization}</p>
                  <p className="text-xs text-muted-foreground mb-4">{expert.location}</p>
                  <div className="flex items-center justify-center gap-4 mb-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Award className="w-4 h-4 text-yellow-500" />
                      <span>{expert.rating}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="w-4 h-4 text-blue-500" />
                      <span>{expert.answers}</span>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full">
                    Ask Expert
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="success" className="space-y-4">
          <Card>
            <CardContent className="p-12 text-center">
              <TrendingUp className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Success Stories Coming Soon</h3>
              <p className="text-muted-foreground">
                This section will feature inspiring stories from farmers who have achieved remarkable results 
                using SmartAgri Advisor and community knowledge.
              </p>
              <Button className="mt-4">
                Share Your Success Story
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Community;